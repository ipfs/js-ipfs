'use strict'

const resources = require('../resources')

module.exports = [
  {
    method: '*',
    path: '/api/v0/name/resolve',
    options: {
      validate: resources.name.resolve.validate
    },
    handler: resources.name.resolve.handler
  },
  {
    method: '*',
    path: '/api/v0/name/publish',
    options: {
      validate: resources.name.publish.validate
    },
    handler: resources.name.publish.handler
  },
  {
    method: '*',
    path: '/api/v0/name/pubsub/state',
    handler: resources.name.pubsub.state.handler
  },
  {
    method: '*',
    path: '/api/v0/name/pubsub/subs',
    handler: resources.name.pubsub.subs.handler
  },
  {
    method: '*',
    path: '/api/v0/name/pubsub/cancel',
    options: {
      validate: resources.name.pubsub.cancel.validate
    },
    handler: resources.name.pubsub.cancel.handler
  }
]
