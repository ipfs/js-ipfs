'use strict'

const multibase = require('multibase')
const { cidToString } = require('../../../utils/cid')
const parseDuration = require('parse-duration').default

module.exports = {
  command: 'stat <key>',

  describe: 'Print information of a raw IPFS block',

  builder: {
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

  async handler ({ ctx, key, cidBase, timeout }) {
    const { ipfs, print } = ctx
    const stats = await ipfs.block.stat(key, {
      timeout
    })
    print('Key: ' + cidToString(stats.cid, { base: cidBase }))
    print('Size: ' + stats.size)
  }
}
