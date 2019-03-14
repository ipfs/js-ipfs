'use strict'

const Boom = require('boom')

module.exports = async (request, h) => {
  const { arg: domain, ...opts } = request.query

  if (!domain) {
    throw Boom.badRequest("Argument 'domain' is required")
  }

  const path = await request.server.app.ipfs.dns(domain, opts)
  return h.response({
    Path: path
  })
}
