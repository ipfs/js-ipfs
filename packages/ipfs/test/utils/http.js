'use strict'

const Hapi = require('@hapi/hapi')
const routes = require('../../src/http/api/routes')

module.exports = (request, { ipfs }) => {
  const server = Hapi.server()
  server.app.ipfs = ipfs

  routes.forEach(route => {
    server.route(route)
  })

  return server.inject(request)
}
