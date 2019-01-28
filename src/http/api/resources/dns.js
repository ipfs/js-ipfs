'use strict'

const Boom = require('boom')

module.exports = async (request, h) => {
  if (!request.query.arg) {
    throw Boom.badRequest("Argument 'domain' is required")
  }

  const path = await request.server.app.ipfs.dns(request.query.arg)
  return h.response({
    Path: path
  })
}
