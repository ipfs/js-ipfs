import { createAddrs } from './addrs.js'
import { createConnect } from './connect.js'
import { createDisconnect } from './disconnect.js'
import { createLocalAddrs } from './local-addrs.js'
import { createPeers } from './peers.js'

export class SwarmAPI {
  /**
   * @param {import('../types').Options} config
   */
  constructor (config) {
    this.addrs = createAddrs(config)
    this.connect = createConnect(config)
    this.disconnect = createDisconnect(config)
    this.localAddrs = createLocalAddrs(config)
    this.peers = createPeers(config)
  }
}
