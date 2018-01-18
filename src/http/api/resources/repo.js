'use strict'

const boom = require('boom')

exports = module.exports

exports.version = (request, reply) => {
  const ipfs = request.server.app.ipfs

  ipfs.repo.version((err, version) => {
    if (err) {
      return reply(boom.badRequest(err))
    }

    reply({
      version: version
    })
  })
}
