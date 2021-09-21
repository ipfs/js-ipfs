import { createWantlist } from './wantlist.js'
import { createWantlistForPeer } from './wantlist-for-peer.js'
import { createStat } from './stat.js'
import { createUnwant } from './unwant.js'

/**
 * @param {import('../types').Options} config
 */
export function createBitswap (config) {
  return {
    wantlist: createWantlist(config),
    wantlistForPeer: createWantlistForPeer(config),
    unwant: createUnwant(config),
    stat: createStat(config)
  }
}
