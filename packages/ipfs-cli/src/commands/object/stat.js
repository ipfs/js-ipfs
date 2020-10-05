'use strict'

const parseDuration = require('parse-duration').default

module.exports = {
  command: 'stat <key>',

  describe: 'Get stats for the DAG node named by <key>',

  builder: {
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print }, key, timeout }) {
    const stats = await ipfs.object.stat(key, { enc: 'base58', timeout })
    delete stats.Hash // only for js-ipfs-http-client output
    Object.keys(stats).forEach((key) => print(`${key}: ${stats[key]}`))
  }
}
