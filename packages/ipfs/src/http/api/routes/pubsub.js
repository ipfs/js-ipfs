'use strict'

const resources = require('../resources')

module.exports = [
  {
    method: '*',
    path: '/api/v0/pubsub/sub',
    handler: resources.pubsub.subscribe.handler,
    options: {
      timeout: {
        socket: false
      }
    }
  },
  {
    method: '*',
    path: '/api/v0/pubsub/pub',
    handler: resources.pubsub.publish.handler
  },
  {
    method: '*',
    path: '/api/v0/pubsub/ls',
    handler: resources.pubsub.ls.handler
  },
  {
    method: '*',
    path: '/api/v0/pubsub/peers',
    handler: resources.pubsub.peers.handler
  }
]
