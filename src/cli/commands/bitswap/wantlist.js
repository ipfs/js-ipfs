'use strict'

const multibase = require('multibase')
const { cidToString } = require('../../../utils/cid')

module.exports = {
  command: 'wantlist [peer]',

  describe: 'Print out all blocks currently on the bitswap wantlist for the local peer.',

  builder: {
    peer: {
      alias: 'p',
      describe: 'Specify which peer to show wantlist for.',
      type: 'string'
    },
    'cid-base': {
      describe: 'Number base to display CIDs in. Note: specifying a CID base for v0 CIDs will have no effect.',
      type: 'string',
      choices: multibase.names
    }
  },

  handler ({ getIpfs, print, peer, cidBase, resolve }) {
    resolve((async () => {
      const ipfs = await getIpfs()
      const list = await ipfs.bitswap.wantlist(peer)
      list.Keys.forEach(k => print(cidToString(k['/'], { base: cidBase, upgrade: false })))
    })())
  }
}
