'use strict'

const Stream = require('readable-stream')
const pump = require('pump')
const moduleConfig = require('./utils/module-config')

module.exports = (arg) => {
  const send = moduleConfig(arg)

  return (id, opts = {}) => {
    // Default number of packtes to 1
    if (!opts.n && !opts.count) {
      opts.n = 1
    }
    const request = {
      path: 'ping',
      args: id,
      qs: opts
    }
    // ndjson streams objects
    const pt = new Stream.PassThrough({
      objectMode: true
    })

    send(request, (err, stream) => {
      if (err) { return pt.destroy(err) }

      pump(stream, pt)
    })

    return pt
  }
}
