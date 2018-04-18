'use strict'

// This is an alias for `bitswap stat`.
const bitswapStats = require('../bitswap/stat.js')
// The command needs to be renamed, else it would be `stats stat` instead of
// `stats bitswap`
bitswapStats.command = 'bitswap'
module.exports = bitswapStats
