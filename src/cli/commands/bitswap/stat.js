'use strict'

const Buffer = require('safe-buffer').Buffer
const CID = require('cids')

module.exports = {
  command: 'stat',

  describe: 'Show some diagnostic information on the bitswap agent.',

  builder: {},

  handler (argv) {
    argv.ipfs.bitswap.stat((err, stats) => {
      if (err) {
        throw err
      }

      stats.Wantlist = stats.Wantlist || []
      stats.Wantlist = stats.Wantlist.map((entry) => {
        const buf = new Buffer(entry.cid.hash.data)
        const cid = new CID(entry.cid.version, entry.cid.codec, buf)
        return cid.toBaseEncodedString()
      })
      stats.Peers = stats.Peers || []

      console.log(`bitswap status
  blocks received: ${stats.BlocksReceived}
  dup blocks received: ${stats.DupBlksReceived}
  dup data received: ${stats.DupDataReceived}B
  wantlist [${stats.Wantlist.length} keys]
    ${stats.Wantlist.join('\n    ')}
  partners [${stats.Peers.length}]
    ${stats.Peers.join('\n    ')}`)
    })
  }
}
