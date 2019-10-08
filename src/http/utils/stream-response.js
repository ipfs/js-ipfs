'use strict'

const { PassThrough } = require('readable-stream')

function streamResponse (request, h, fn) {
  const output = new PassThrough()
  const errorTrailer = 'X-Stream-Error'

  Promise.resolve()
    .then(() => fn(output))
    .catch(err => {
      request.raw.res.addTrailers({
        [errorTrailer]: JSON.stringify({
          Message: err.message,
          Code: 0
        })
      })
    })
    .finally(() => {
      output.end()
    })

  return h.response(output)
    .header('x-chunked-output', '1')
    .header('content-type', 'application/json')
    .header('Trailer', errorTrailer)
}

module.exports = streamResponse
