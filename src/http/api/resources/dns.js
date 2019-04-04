'use strict'

const Boom = require('boom')

module.exports = async (request, h) => {
  const { arg: domain, recursive, format } = request.query

  if (!domain) {
    throw Boom.badRequest("Argument 'domain' is required")
  }

  const path = await request.server.app.ipfs.dns(domain, { recursive, format })
  return h.response({
    Path: path
  })
}
