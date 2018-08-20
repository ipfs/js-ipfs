'use strict'

const resources = require('../resources')

module.exports = (server) => {
  server.route({
    method: '*',
    path: '/ipfs/{cid*}',
    config: {
      pre: [
        { method: resources.gateway.checkCID, assign: 'args' }
      ],
      handler: resources.gateway.handler
    }
  })
}
