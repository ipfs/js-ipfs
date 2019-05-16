'use strict'

const Stream = require('readable-stream')
const pump = require('pump')
const through = require('through2')
const { checkArgs, normalizeOpts } = require('./refs')

module.exports = (send) => {
  return (args, opts) => {
    opts = normalizeOpts(opts)

    const pt = new Stream.PassThrough({ objectMode: true })

    try {
      args = checkArgs(args)
    } catch (err) {
      return pt.destroy(err)
    }

    send({ path: 'refs', args, qs: opts }, (err, stream) => {
      if (err) { return pt.destroy(err) }

      stream.once('error', (err) => pt.destroy(err))

      pump(stream, through.obj(function (r, enc, cb) {
        cb(null, { ref: r.Ref, err: r.Err })
      }), pt)
    })

    return pt
  }
}
