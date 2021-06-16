'use strict'

const { pipe } = require('it-pipe')
// @ts-ignore no types
const toIterable = require('stream-to-it')
// @ts-ignore no types
const ndjson = require('iterable-ndjson')

const errorTrailer = 'X-Stream-Error'

/**
 *
 * @param {import('../types').Request} request
 * @param {import('@hapi/hapi').ResponseToolkit} h
 * @param {() => AsyncIterable<any>} getSource
 * @param {{ objectMode?: boolean, onError?: (error: Error) => void }} [options]
 */
async function streamResponse (request, h, getSource, options = {}) {
  request.raw.res.setHeader('x-chunked-output', '1')
  request.raw.res.setHeader('content-type', 'application/json')
  request.raw.res.setHeader('Trailer', errorTrailer)

  pipe(
    async function * () {
      yield * getSource()
    },
    options.objectMode ? ndjson.stringify : (/** @type {Uint8Array} */ chunk) => chunk,
    toIterable.sink(request.raw.res)
  )
    .catch((/** @type {Error} */ err) => {
      if (options.onError) {
        options.onError(err)
      }

      if (!request.raw.res.writableEnded) {
        request.raw.res.write(' ')
      }

      request.raw.res.addTrailers({
        [errorTrailer]: JSON.stringify({
          Message: err.message,
          Code: 0
        })
      })
    })
    .finally(() => {
      request.raw.res.end()
    })

  return h.abandon
}

module.exports = streamResponse
