'use strict'

const resources = require('../resources')

module.exports = [
  {
    method: 'POST',
    path: '/api/v0/swarm/peers',
    handler: resources.swarm.peers.handler
  },
  {
    method: 'POST',
    path: '/api/v0/swarm/addrs',
    handler: resources.swarm.addrs.handler
  },
  {
    method: 'POST',
    path: '/api/v0/swarm/addrs/local',
    handler: resources.swarm.localAddrs.handler
  },
  {
    method: 'POST',
    path: '/api/v0/swarm/connect',
    options: {
      pre: [
        { method: resources.swarm.connect.parseArgs, assign: 'args' }
      ]
    },
    handler: resources.swarm.connect.handler
  },
  {
    method: 'POST',
    path: '/api/v0/swarm/disconnect',
    options: {
      pre: [
        { method: resources.swarm.disconnect.parseArgs, assign: 'args' }
      ]
    },
    handler: resources.swarm.disconnect.handler
  }
  // TODO
  // {
  //  method: 'POST',
  //  path: '/api/v0/swarm/filters',
  //  handler: resources.swarm.disconnect
  // }
]
