'use strict'

const Stream = require('readable-stream')
const pump = require('pump')

module.exports = (send) => {
  return (args, opts) => {
    opts = opts || {}

    const pt = new Stream.PassThrough()

    send({
      path: 'files/read',
      args: args,
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
