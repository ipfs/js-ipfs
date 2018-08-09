'use strict'

const resources = require('./../resources')

module.exports = (server) => {
  const api = server.select('API')

  api.route({
    method: '*',
    path: '/api/v0/name/resolve',
    config: {
      handler: resources.name.resolve.handler,
      validate: resources.name.resolve.validate
    }
  })

  api.route({
    method: '*',
    path: '/api/v0/name/publish',
    config: {
      handler: resources.name.publish.handler,
      validate: resources.name.publish.validate
    }
  })
}
