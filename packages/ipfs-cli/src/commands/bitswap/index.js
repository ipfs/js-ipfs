import bitswapStat from './stat.js'
import bitswapUnwant from './unwant.js'
import bitswapWantlist from './wantlist.js'

/** @type {import('yargs').CommandModule[]} */
export const commands = [
  bitswapStat,
  bitswapUnwant,
  bitswapWantlist
]
