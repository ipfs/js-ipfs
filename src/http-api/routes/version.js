'use strict'

const resources = require('./../resources')

module.exports = (server) => {
  const api = server.select('API')

  api.route({
    method: 'GET',
    path: '/api/v0/version',
    handler: resources.version.get
  })
}
