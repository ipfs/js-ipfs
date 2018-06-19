'use strict'

const resources = require('./../resources')

module.exports = (server) => {
  const api = server.select('API')

  api.route({
    method: '*',
    path: '/api/v0/pin/add',
    config: {
      pre: [
        { method: resources.pin.add.parseArgs, assign: 'args' }
      ],
      handler: resources.pin.add.handler
    }
  })

  api.route({
    method: '*',
    path: '/api/v0/pin/rm',
    config: {
      pre: [
        { method: resources.pin.rm.parseArgs, assign: 'args' }
      ],
      handler: resources.pin.rm.handler
    }
  })

  api.route({
    method: '*',
    path: '/api/v0/pin/ls',
    config: {
      pre: [
        { method: resources.pin.ls.parseArgs, assign: 'args' }
      ],
      handler: resources.pin.ls.handler
    }
  })
}
