'use strict'

const { PassThrough } = require('stream')
const log = require('debug')('ipfs:http-api:utils:stream-response')
const Boom = require('@hapi/boom')

const ERROR_TRAILER = 'X-Stream-Error'

/**
 *
 * @param {import('../types').Request} request
 * @param {import('@hapi/hapi').ResponseToolkit} h
 * @param {() => AsyncIterable<any>} getSource
 * @param {{ onError?: (error: Error) => void, onEnd?: () => void }} [options]
 */
async function streamResponse (request, h, getSource, options = {}) {
  const stream = new PassThrough()
  const res = h.response(stream)
    .header('X-Chunked-Output', '1')
    .header('Content-Type', 'application/json')
    .header('Trailer', ERROR_TRAILER)

  Promise.resolve()
    .then(async () => {
      try {
        for await (const chunk of getSource()) {
          if (chunk instanceof Uint8Array || typeof chunk === 'string') {
            stream.write(chunk)
          } else {
            stream.write(JSON.stringify(chunk) + '\n')
          }
        }

        if (options.onEnd) {
          options.onEnd()
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
          if (Boom.isBoom(err)) {
            res.code(err.output.statusCode)
          } else {
            res.code(500)
          }

          stream.write(JSON.stringify({
            Message: err.message,
            Code: 0
          }) + '\n')
        }
      } finally {
        stream.end()
      }
    })

  return res
}

module.exports = streamResponse
