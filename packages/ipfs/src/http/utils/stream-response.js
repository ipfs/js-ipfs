'use strict'

const { PassThrough } = require('stream')
const pipe = require('it-pipe')
const log = require('debug')('ipfs:http-api:utils:stream-response')
const toIterable = require('stream-to-it')

const errorTrailer = 'X-Stream-Error'

async function streamResponse (request, h, getSource, options) {
  options = options || {}
  options.objectMode = options.objectMode !== false

  // eslint-disable-next-line no-async-promise-executor
  const stream = await new Promise(async (resolve, reject) => {
    let started = false
    const stream = new PassThrough()

    try {
      await pipe(
        (async function * () {
          try {
            for await (const chunk of getSource()) {
              if (!started) {
                started = true
                resolve(stream)
              }
              yield chunk
            }

            if (!started) { // Maybe it was an empty source?
              started = true
              resolve(stream)
            }
          } catch (err) {
            log(err)

            if (options.onError) {
              options.onError(err)
            }

            if (started) {
              request.raw.res.addTrailers({
                [errorTrailer]: JSON.stringify({
                  Message: err.message,
                  Code: 0
                })
              })
            }

            throw err
          }
        })(),
        toIterable.sink(stream)
      )
    } catch (err) {
      reject(err)
    }
  })

  return h.response(stream)
    .header('x-chunked-output', '1')
    .header('content-type', 'application/json')
    .header('Trailer', errorTrailer)
}

module.exports = streamResponse
