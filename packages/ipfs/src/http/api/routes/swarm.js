'use strict'

const resources = require('../resources')

module.exports = [
  {
    method: 'POST',
    path: '/api/v0/swarm/peers',
    ...resources.swarm.peers
  },
  {
    method: 'POST',
    path: '/api/v0/swarm/addrs',
    ...resources.swarm.addrs
  },
  {
    method: 'POST',
    path: '/api/v0/swarm/addrs/local',
    ...resources.swarm.localAddrs
  },
  {
    method: 'POST',
    path: '/api/v0/swarm/connect',
    ...resources.swarm.connect
  },
  {
    method: 'POST',
    path: '/api/v0/swarm/disconnect',
    ...resources.swarm.disconnect
  }
]
