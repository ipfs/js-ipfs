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
    ext: {
      onPostHandler: { method: resources.gateway.afterHandler }
    }
  }
}
