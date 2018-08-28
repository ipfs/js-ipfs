'use strict'

const resources = require('./../resources')

module.exports = (server) => {
  const api = server.select('API')

  api.route({
    method: '*',
    path: '/api/v0/resolve',
    config: {
      handler: resources.resolve.handler,
      validate: resources.resolve.validate
    }
  })
}
