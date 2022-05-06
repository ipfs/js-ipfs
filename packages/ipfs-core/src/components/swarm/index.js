import { createAddrs } from './addrs.js'
import { createConnect } from './connect.js'
import { createDisconnect } from './disconnect.js'
import { createLocalAddrs } from './local-addrs.js'
import { createPeers } from './peers.js'

export class SwarmAPI {
  /**
   * @param {object} config
   * @param {import('../../types').NetworkService} config.network
   */
  constructor ({ network }) {
    this.addrs = createAddrs({ network })
    this.connect = createConnect({ network })
    this.disconnect = createDisconnect({ network })
    this.localAddrs = createLocalAddrs({ network })
    this.peers = createPeers({ network })
  }
}
