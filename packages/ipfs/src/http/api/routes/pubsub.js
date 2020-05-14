'use strict'

const resources = require('../resources')

module.exports = [
  {
    method: 'POST',
    path: '/api/v0/pubsub/sub',
    ...resources.pubsub.subscribe
  },
  {
    method: 'POST',
    path: '/api/v0/pubsub/pub',
    ...resources.pubsub.publish
  },
  {
    method: 'POST',
    path: '/api/v0/pubsub/ls',
    ...resources.pubsub.ls
  },
  {
    method: 'POST',
    path: '/api/v0/pubsub/peers',
    ...resources.pubsub.peers
  }
]
