'use strict'

const multibase = require('multibase')
const { cidToString } = require('ipfs-core-utils/src/cid')
const { default: parseDuration } = require('parse-duration')
const { coerceCID } = require('../../utils')

module.exports = {
  command: 'stat <key>',

  describe: 'Print information of a raw IPFS block',

  builder: {
    key: {
      type: 'string',
      coerce: coerceCID
    },
    'cid-base': {
      describe: 'Number base to display CIDs in.',
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
    const stats = await ipfs.block.stat(key, {
      timeout
    })
    print('Key: ' + cidToString(stats.cid, { base: cidBase }))
    print('Size: ' + stats.size)
  }
}
