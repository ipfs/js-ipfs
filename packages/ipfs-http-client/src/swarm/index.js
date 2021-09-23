import { createAddrs } from './addrs.js'
import { createConnect } from './connect.js'
import { createDisconnect } from './disconnect.js'
import { createLocalAddrs } from './local-addrs.js'
import { createPeers } from './peers.js'

/**
 * @param {import('../types').Options} config
 */
export function createSwarm (config) {
  return {
    addrs: createAddrs(config),
    connect: createConnect(config),
    disconnect: createDisconnect(config),
    localAddrs: createLocalAddrs(config),
    peers: createPeers(config)
  }
}
