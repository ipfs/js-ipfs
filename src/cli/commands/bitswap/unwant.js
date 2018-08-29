'use strict'

const multibase = require('multibase')
const { print } = require('../../utils')
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
      describe: 'Number base to display CIDs in.',
      type: 'string',
      choices: multibase.names
    }
  },
  handler (argv) {
    argv.ipfs.bitswap.unwant(argv.key, (err) => {
      if (err) {
        throw err
      }
      print(`Key ${cidToString(argv.key, argv.cidBase)} removed from wantlist`)
    })
  }
}
