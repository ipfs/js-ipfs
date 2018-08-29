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

  api.route({
    method: '*',
    path: '/api/v0/name/pubsub/state',
    config: {
      handler: resources.name.pubsub.state.handler
    }
  })

  api.route({
    method: '*',
    path: '/api/v0/name/pubsub/subs',
    config: {
      handler: resources.name.pubsub.subs.handler
    }
  })

  api.route({
    method: '*',
    path: '/api/v0/name/pubsub/cancel',
    config: {
      handler: resources.name.pubsub.cancel.handler,
      validate: resources.name.pubsub.cancel.validate
    }
  })
}
