'use strict'

const multibase = require('multibase')
const { cidToString } = require('../../../utils/cid')

module.exports = {
  command: 'unwant <key>',

  describe: 'Removes a given block from your wantlist.',

  builder: {
    key: {
      alias: 'k',
      describe: 'Key to remove from your wantlist',
      type: 'string'
    },
    'cid-base': {
      describe: 'Number base to display CIDs in. Note: specifying a CID base for v0 CIDs will have no effect.',
      type: 'string',
      choices: multibase.names
    }
  },
  handler ({ getIpfs, print, key, cidBase, resolve }) {
    resolve((async () => {
      const ipfs = await getIpfs()
      await ipfs.bitswap.unwant(key)
      print(`Key ${cidToString(key, { base: cidBase, upgrade: false })} removed from wantlist`)
    })())
  }
}
