'use strict'

const multibase = require('multibase')
const { print } = require('../../utils')

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

  handler (argv) {
    const { key, cidBase } = argv

    argv.ipfs.block.stat(key, { cidBase }, (err, stats) => {
      if (err) {
        throw err
      }

      print('Key: ' + stats.key)
      print('Size: ' + stats.size)
    })
  }
}
