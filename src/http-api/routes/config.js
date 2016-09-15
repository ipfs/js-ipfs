'use strict'

const resources = require('./../resources')

module.exports = (server) => {
  const api = server.select('API')

  api.route({
    method: '*',
    path: '/api/v0/config/{key?}',
    config: {
      pre: [
        { method: resources.config.getOrSet.parseArgs, assign: 'args' }
      ],
      handler: resources.config.getOrSet.handler
    }
  })

  api.route({
    method: '*',
    path: '/api/v0/config/show',
    handler: resources.config.show
  })

  api.route({
    method: '*',
    path: '/api/v0/config/replace',
    config: {
      payload: {
        parse: false,
        output: 'stream'
      },
      pre: [
        { method: resources.config.replace.parseArgs, assign: 'args' }
      ],
      handler: resources.config.replace.handler
    }
  })
}
