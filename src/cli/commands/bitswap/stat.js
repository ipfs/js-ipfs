'use strict'

const utils = require('../../utils')

module.exports = {
  command: 'stat',

  describe: 'Show some diagnostic information on the bitswap agent.',

  builder: {},

  handler () {
    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }

      ipfs.bitswap.stat((err, stats) => {
        if (err) {
          throw err
        }

        stats.Wantlist = stats.Wantlist || []
        stats.Peers = stats.Peers || []

        console.log(`
bitswap status
  blocks received: ${stats.BlocksReceived}
  dup blocks received: ${stats.DupBlksReceived}
  dup data received: ${stats.DupDataReceived}B
  wantlist [${stats.Wantlist.length} keys]
    ${stats.Wantlist.join('\n    ')}
  partners [${stats.Peers.length}]
    ${stats.Peers.join('\n    ')}`)
      })
    })
  }
}
