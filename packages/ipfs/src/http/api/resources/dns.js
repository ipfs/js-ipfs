'use strict'

const Boom = require('@hapi/boom')

module.exports = async (request, h) => {
  const domain = request.query.arg

  if (!domain) {
    throw Boom.badRequest("Argument 'domain' is required")
  }

  const format = request.query.format

  // query parameters are passed as strings and need to be parsed to expected type
  let recursive = request.query.recursive || request.query.r
  recursive = !(recursive && recursive === 'false')

  const path = await request.server.app.ipfs.dns(domain, { recursive, format })
  return h.response({
    Path: path
  })
}
