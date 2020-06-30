'use strict'

const resources = require('../resources')

module.exports = [
  {
    method: 'POST',
    path: '/api/v0/name/resolve',
    ...resources.name.resolve
  },
  {
    method: 'POST',
    path: '/api/v0/name/publish',
    ...resources.name.publish
  },
  {
    method: 'POST',
    path: '/api/v0/name/pubsub/state',
    ...resources.name.pubsub.state
  },
  {
    method: 'POST',
    path: '/api/v0/name/pubsub/subs',
    ...resources.name.pubsub.subs
  },
  {
    method: 'POST',
    path: '/api/v0/name/pubsub/cancel',
    ...resources.name.pubsub.cancel
  }
]
