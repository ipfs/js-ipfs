'use strict'

const Stream = require('readable-stream')
const pump = require('pump')
const through = require('through2')

module.exports = (send) => {
  return (opts) => {
    opts = opts || {}

    const pt = new Stream.PassThrough({ objectMode: true })

    send({ path: 'refs/local', qs: opts }, (err, stream) => {
      if (err) { return pt.destroy(err) }

      stream.once('error', (err) => pt.destroy(err))

      pump(stream, through.obj(function (r, enc, cb) {
        cb(null, { ref: r.Ref, err: r.Err })
      }), pt)
    })

    return pt
  }
}
