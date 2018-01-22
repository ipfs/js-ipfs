'use strict'

const boom = require('boom')

exports = module.exports

exports.get = (request, reply) => {
  if (!request.query.arg) {
    return reply({
      Message: "Argument 'domain' is required",
      Code: 0
    }).code(400).takeover()
  }

  request.server.app.ipfs.dns(request.query.arg, (err, path) => {
    if (err) {
      return reply(boom.badRequest(err))
    }

    return reply({
      Path: path
    })
  })
}
