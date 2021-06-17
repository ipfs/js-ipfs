'use strict'

const { pipe } = require('it-pipe')
const log = require('debug')('ipfs:http-api:utils:stream-response')
// @ts-ignore no types
const toIterable = require('stream-to-it')

const ERROR_TRAILER = 'X-Stream-Error'

/**
 * @param {import('../types').Request} request
 * @param {import('@hapi/hapi').ResponseToolkit} h
 * @param {() => AsyncIterable<any>} getSource
 * @param {{onError?: (error: Error) => void }} [options]
 */
async function streamResponse (request, h, getSource, options = {}) {
  request.raw.res.setHeader('X-Chunked-Output', '1')
  request.raw.res.setHeader('Content-Type', 'application/json')
  request.raw.res.setHeader('Trailer', ERROR_TRAILER)

  pipe(
    async function * () {
      try {
        for await (const chunk of getSource()) {
          if (chunk instanceof Uint8Array || typeof chunk === 'string') {
            yield chunk
          } else {
            yield JSON.stringify(chunk) + '\n'
          }
        }
      } catch (err) {
        log(err)

        if (options.onError) {
          options.onError(err)
        }

        if (request.raw.res.headersSent) {
          request.raw.res.addTrailers({
            [ERROR_TRAILER]: JSON.stringify({
              Message: err.message,
              Code: 0
            })
          })
        } else {
          request.raw.res.statusCode = 500

          yield JSON.stringify({
            Message: err.message,
            Code: 0
          }) + '\n'
        }
      }
    },
    toIterable.sink(request.raw.res)
  )

  return h.abandon
}

module.exports = streamResponse
