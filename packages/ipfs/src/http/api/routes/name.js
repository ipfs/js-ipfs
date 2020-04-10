'use strict'

const resources = require('../resources')

module.exports = [
  {
    method: 'POST',
    path: '/api/v0/name/resolve',
    options: {
      validate: resources.name.resolve.validate
    },
    handler: resources.name.resolve.handler
  },
  {
    method: 'POST',
    path: '/api/v0/name/publish',
    options: {
      validate: resources.name.publish.validate
    },
    handler: resources.name.publish.handler
  },
  {
    method: 'POST',
    path: '/api/v0/name/pubsub/state',
    handler: resources.name.pubsub.state.handler
  },
  {
    method: 'POST',
    path: '/api/v0/name/pubsub/subs',
    handler: resources.name.pubsub.subs.handler
  },
  {
    method: 'POST',
    path: '/api/v0/name/pubsub/cancel',
    options: {
      validate: resources.name.pubsub.cancel.validate
    },
    handler: resources.name.pubsub.cancel.handler
  }
]
