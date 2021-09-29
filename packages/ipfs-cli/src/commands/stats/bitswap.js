import bitswapStat from '../bitswap/stat.js'

// This is an alias for `bitswap stat`.
export default {
  ...bitswapStat,
  // The command needs to be renamed, else it would be `stats stat` instead of
  // `stats bitswap`
  command: 'bitswap'
}
