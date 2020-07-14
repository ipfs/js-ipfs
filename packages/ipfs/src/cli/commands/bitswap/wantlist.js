'use strict'

const multibase = require('multibase')
const { cidToString } = require('../../../utils/cid')
const parseDuration = require('parse-duration').default

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
      choices: Object.keys(multibase.names)
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  async handler ({ ctx, peer, cidBase, timeout }) {
    const { ipfs, print } = ctx
    let list

    if (peer) {
      list = await ipfs.bitswap.wantlistForPeer(peer, {
        timeout
      })
    } else {
      list = await ipfs.bitswap.wantlist({
        timeout
      })
    }

    list.forEach(cid => print(cidToString(cid, { base: cidBase, upgrade: false })))
  }
}
