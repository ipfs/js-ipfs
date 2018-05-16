'use strict'

const pump = require('pump')
const moduleConfig = require('./utils/module-config')
const PingMessageStream = require('./utils/ping-message-stream')

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

    const response = new PingMessageStream()

    send(request, (err, stream) => {
      if (err) { return response.emit('error', err) }
      pump(stream, response)
    })

    return response
  }
}
