'use strict'

const resources = require('../resources')

module.exports = {
  method: '*',
  path: '/ipfs/{cid*}',
  options: {
    handler: resources.gateway.handler,
    pre: [
      { method: resources.gateway.checkCID, assign: 'args' }
    ],
    response: {
      ranges: false // disable built-in support, we do it manually
    },
    ext: {
      onPostHandler: { method: resources.gateway.afterHandler }
    }
  }
}
