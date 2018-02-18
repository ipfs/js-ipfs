'use strict'

const CID = require('cids')
const print = require('../../utils').print

module.exports = {
  command: 'stat',

  describe: 'Show some diagnostic information on the bitswap agent.',

  builder: {},

  handler (argv) {
    argv.ipfs.bitswap.stat((err, stats) => {
      if (err) {
        throw err
      }

      stats.wantlist = stats.wantlist || []
      stats.wantlist = stats.wantlist.map((entry) => {
        const buf = Buffer.from(entry.cid.hash.data)
        const cid = new CID(entry.cid.version, entry.cid.codec, buf)
        return cid.toBaseEncodedString()
      })
      stats.peers = stats.peers || []

      print(`bitswap status
  blocks received: ${stats.blocksReceived}
  dup blocks received: ${stats.dupBlksReceived}
  dup data received: ${stats.dupDataReceived}B
  wantlist [${stats.wantlist.length} keys]
    ${stats.wantlist.join('\n    ')}
  partners [${stats.peers.length}]
    ${stats.peers.join('\n    ')}`)
    })
  }
}
