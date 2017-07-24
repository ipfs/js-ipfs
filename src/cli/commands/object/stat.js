'use strict'

const print = require('../../utils').print

module.exports = {
  command: 'stat <key>',

  describe: 'Get stats for the DAG node named by <key>',

  builder: {},

  handler (argv) {
    argv.ipfs.object.stat(argv.key, {
      enc: 'base58'
    }, (err, stats) => {
      if (err) {
        throw err
      }

      delete stats.Hash // only for js-ipfs-api output

      Object.keys(stats).forEach((key) => {
        print(`${key}: ${stats[key]}`)
      })
    })
  }
}
