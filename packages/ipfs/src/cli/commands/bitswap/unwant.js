'use strict'

const multibase = require('multibase')
const { cidToString } = require('../../../utils/cid')
const parseDuration = require('parse-duration').default

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
      choices: Object.keys(multibase.names)
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },
  async handler ({ ctx, key, cidBase, timeout }) {
    const { ipfs, print } = ctx
    await ipfs.bitswap.unwant(key, {
      timeout
    })
    print(`Key ${cidToString(key, { base: cidBase, upgrade: false })} removed from wantlist`)
  }
}
