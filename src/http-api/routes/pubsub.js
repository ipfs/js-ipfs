'use strict'

const resources = require('./../resources')

module.exports = (server) => {
  const api = server.select('API')

  api.route({
    method: '*',
    path: '/api/v0/pubsub/sub',
    config: {
      handler: resources.pubsub.subscribe.handler
    }
  })

  api.route({
    method: '*',
    path: '/api/v0/pubsub/pub',
    config: {
      handler: resources.pubsub.publish.handler
    }
  })

  api.route({
    method: '*',
    path: '/api/v0/pubsub/ls',
    config: {
      handler: resources.pubsub.ls.handler
    }
  })

  api.route({
    method: '*',
    path: '/api/v0/pubsub/peers',
    config: {
      handler: resources.pubsub.peers.handler
    }
  })
}
