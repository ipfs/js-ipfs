'use strict'

const multibase = require('multibase')
const print = require('../../utils').print
const { cidToString } = require('../../../utils/cid')

module.exports = {
  command: 'stat <key>',

  describe: 'Get stats for the DAG node named by <key>',

  builder: {
    'cid-base': {
      describe: 'Number base to display CIDs in.',
      type: 'string',
      choices: multibase.names
    }
  },

  handler ({ ipfs, key, cidBase }) {
    ipfs.object.stat(key, { enc: 'base58' }, (err, stats) => {
      if (err) {
        throw err
      }

      delete stats.Hash // only for js-ipfs-http-client output

      Object.keys(stats).forEach((key) => {
        print(`${key}: ${cidToString(stats[key], cidBase)}`)
      })
    })
  }
}
