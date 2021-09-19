import { createWantlist } from './wantlist.js'
import { createWantlistForPeer } from './wantlist-for-peer.js'
import { createStat } from './stat.js'
import { createUnwant } from './unwant.js'

export class BitswapAPI {
  /**
   * @param {import('../types').Options} config
   */
  constructor (config) {
    this.wantlist = createWantlist(config)
    this.wantlistForPeer = createWantlistForPeer(config)
    this.unwant = createUnwant(config)
    this.stat = createStat(config)
  }
}
