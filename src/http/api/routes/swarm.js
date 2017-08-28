'use strict'

const resources = require('./../resources')

module.exports = (server) => {
  const api = server.select('API')

  api.route({
    method: '*',
    path: '/api/v0/swarm/peers',
    config: {
      handler: resources.swarm.peers.handler
    }
  })

  api.route({
    method: '*',
    path: '/api/v0/swarm/addrs',
    config: {
      handler: resources.swarm.addrs.handler
    }
  })

  api.route({
    method: '*',
    path: '/api/v0/swarm/addrs/local',
    config: {
      handler: resources.swarm.localAddrs.handler
    }
  })

  api.route({
    method: '*',
    path: '/api/v0/swarm/connect',
    config: {
      pre: [
        { method: resources.swarm.connect.parseArgs, assign: 'args' }
      ],
      handler: resources.swarm.connect.handler
    }
  })

  api.route({
    method: '*',
    path: '/api/v0/swarm/disconnect',
    config: {
      pre: [
        { method: resources.swarm.disconnect.parseArgs, assign: 'args' }
      ],
      handler: resources.swarm.disconnect.handler
    }
  })

  // TODO
  // api.route({
  //  method: '*',
  //  path: '/api/v0/swarm/filters',
  //  config: {
  //    handler: resources.swarm.disconnect
  //  }
  // })
}
