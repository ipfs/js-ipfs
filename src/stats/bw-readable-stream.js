'use strict'

const Stream = require('readable-stream')
const pump = require('pump')
const transformChunk = require('./bw-util')

module.exports = (send) => {
  return (opts) => {
    opts = opts || {}

    const pt = new Stream.Transform({
      objectMode: true,
      transform (chunk, encoding, cb) {
        cb(null, transformChunk(chunk))
      }
    })

    send({
      path: 'stats/bw',
      qs: opts
    }, (err, stream) => {
      if (err) {
        return pt.destroy(err)
      }

      pump(stream, pt)
    })

    return pt
  }
}
