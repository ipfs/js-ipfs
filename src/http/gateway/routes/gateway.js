'use strict'

const resources = require('../resources')

module.exports = [
  {
    method: '*',
    path: '/ipfs/{immutableId*}',
    options: {
      handler: resources.gateway.handler,
      pre: [
        { method: resources.gateway.checkImmutableId, assign: 'args' }
      ],
      response: {
        ranges: false // disable built-in support, we do it manually
      },
      ext: {
        onPostHandler: { method: resources.gateway.afterHandler }
      }
    }
  },
  {
    method: '*',
    path: '/ipns/{mutableId*}',
    options: {
      handler: resources.gateway.handler,
      pre: [
        { method: resources.gateway.checkMutableId, assign: 'args' }
      ],
      response: {
        ranges: false // disable built-in support, we do it manually
      },
      ext: {
        onPostHandler: { method: resources.gateway.afterHandler }
      }
    }
  }
]
