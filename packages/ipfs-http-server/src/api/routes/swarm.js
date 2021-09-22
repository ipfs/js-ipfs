import {
  peersResource,
  addrsResource,
  localAddrsResource,
  connectResource,
  disconnectResource
} from '../resources/swarm.js'

export default [
  {
    method: 'POST',
    path: '/api/v0/swarm/peers',
    ...peersResource
  },
  {
    method: 'POST',
    path: '/api/v0/swarm/addrs',
    ...addrsResource
  },
  {
    method: 'POST',
    path: '/api/v0/swarm/addrs/local',
    ...localAddrsResource
  },
  {
    method: 'POST',
    path: '/api/v0/swarm/connect',
    ...connectResource
  },
  {
    method: 'POST',
    path: '/api/v0/swarm/disconnect',
    ...disconnectResource
  }
]
