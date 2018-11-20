'use strict'

const print = require('../../utils').print

module.exports = {
  command: 'stat <key>',

  describe: 'Get stats for the DAG node named by <key>',

  builder: {},

  handler ({ ipfs, key, cidBase }) {
    ipfs.object.stat(key, { enc: 'base58' }, (err, stats) => {
      if (err) {
        throw err
      }

      delete stats.Hash // only for js-ipfs-http-client output

      Object.keys(stats).forEach((key) => {
        print(`${key}: ${stats[key]}`)
      })
    })
  }
}
