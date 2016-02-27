const api = require('./../index.js').server.select('API')
const resources = require('./../resources')

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
    pre: [
      { method: resources.config.replace.parseArgs, assign: 'args' }
    ],
    handler: resources.config.replace.handler
  }
})
