'use strict'

const boom = require('boom')

exports = module.exports

exports.get = (request, reply) => {
  request.server.app.ipfs.version((err, version) => {
    if (err) {
      return reply(boom.badRequest(err))
    }

    reply(version)
  })
}
