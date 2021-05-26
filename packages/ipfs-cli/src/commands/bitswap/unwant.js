'use strict'

const multibase = require('multibase')
const { cidToString } = require('ipfs-core-utils/src/cid')
const { default: parseDuration } = require('parse-duration')
const { coerceCID } = require('../../utils')

module.exports = {
  command: 'unwant <key>',

  describe: 'Removes a given block from your wantlist.',

  builder: {
    key: {
      alias: 'k',
      describe: 'Key to remove from your wantlist',
      type: 'string',
      coerce: coerceCID
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

  /**
   * @param {object} argv
   * @param {import('../../types').Context} argv.ctx
   * @param {import('cids')} argv.key
   * @param {import('multibase').BaseName} argv.cidBase
   * @param {number} argv.timeout
   */
  async handler ({ ctx, key, cidBase, timeout }) {
    const { ipfs, print } = ctx
    await ipfs.bitswap.unwant(key, {
      timeout
    })
    print(`Key ${cidToString(key, { base: cidBase, upgrade: false })} removed from wantlist`)
  }
}
