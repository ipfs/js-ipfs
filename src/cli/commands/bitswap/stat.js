'use strict'

const multibase = require('multibase')
const { cidToString } = require('../../../utils/cid')

module.exports = {
  command: 'stat',

  describe: 'Show some diagnostic information on the bitswap agent.',

  builder: {
    'cid-base': {
      describe: 'Number base to display CIDs in. Note: specifying a CID base for v0 CIDs will have no effect.',
      type: 'string',
      choices: multibase.names
    }
  },

  handler ({ getIpfs, print, cidBase, resolve }) {
    resolve((async () => {
      const ipfs = await getIpfs()
      const stats = await ipfs.bitswap.stat()
      stats.wantlist = stats.wantlist.map(k => cidToString(k['/'], { base: cidBase, upgrade: false }))
      stats.peers = stats.peers || []

      print(`bitswap status
  blocks received: ${stats.blocksReceived}
  dup blocks received: ${stats.dupBlksReceived}
  dup data received: ${stats.dupDataReceived}B
  wantlist [${stats.wantlist.length} keys]
    ${stats.wantlist.join('\n    ')}
  partners [${stats.peers.length}]
    ${stats.peers.join('\n    ')}`)
    })())
  }
}
