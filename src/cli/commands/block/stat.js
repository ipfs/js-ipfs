'use strict'

const multibase = require('multibase')
const { cidToString } = require('../../../utils/cid')

module.exports = {
  command: 'stat <key>',

  describe: 'Print information of a raw IPFS block',

  builder: {
    'cid-base': {
      describe: 'Number base to display CIDs in.',
      type: 'string',
      choices: multibase.names
    }
  },

  async handler ({ ipfs, print, key, cidBase }) {
    const stats = await ipfs.api.block.stat(key)
    print('Key: ' + cidToString(stats.cid, { base: cidBase }))
    print('Size: ' + stats.size)
  }
}
