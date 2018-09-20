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
  handler ({ ipfs, key, cidBase }) {
    ipfs.bitswap.unwant(key, (err) => {
      if (err) {
        throw err
      }
      print(`Key ${cidToString(key, cidBase)} removed from wantlist`)
    })
  }
}
