'use strict'

const resources = require('../resources')

module.exports = (server) => {
  const gateway = server.select('Gateway')

  gateway.route({
    method: '*',
    path: '/ipfs/{hash*}',
    config: {
      pre: [
        { method: resources.gateway.checkHash, assign: 'args' }
      ],
      handler: resources.gateway.handler
    }
  })
}
