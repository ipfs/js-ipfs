'use strict'

const Hapi = require('@hapi/hapi')
const routes = require('../../src/http')

module.exports = (request, { ipfs }) => {
  const server = Hapi.server()
  server.app.ipfs = ipfs

  for (const key in routes) {
    if (Object.prototype.hasOwnProperty.call(routes, key)) {
      server.route(routes[key])
    }
  }

  return server.inject(request)
}
