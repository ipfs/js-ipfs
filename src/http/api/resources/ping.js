'use strict'

const boom = require('boom')

exports = module.exports

exports.get = (request, reply) => {
  const ipfs = request.server.app.ipfs
  const peerId = request.query.arg

  ipfs.ping(peerId, (err, outputStream) => {
    if (err) {
      return reply(boom.badRequest(err))
    }

    return reply(outputStream).type('application/json').header('x-chunked-output', '1')
  })
}
