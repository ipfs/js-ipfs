'use strict'

const resources = require('./../resources')

module.exports = (server) => {
  const api = server.select('API')

  api.route({
    method: '*',
    path: '/api/v0/pin/add',
    config: {
      handler: resources.pin.add.handler
    }
  })

  api.route({
    method: '*',
    path: '/api/v0/pin/rm',
    config: {
      handler: resources.pin.rm.handler
    }
  })

  api.route({
    method: '*',
    path: '/api/v0/pin/ls',
    config: {
      handler: resources.pin.ls
    }
  })
}
