'use strict'

module.exports = {
  command: 'stat <key>',

  describe: 'Get stats for the DAG node named by <key>',

  async handler ({ ipfs, print, key, cidBase }) {
    const stats = await ipfs.api.object.stat(key, { enc: 'base58' })
    delete stats.Hash // only for js-ipfs-http-client output
    Object.keys(stats).forEach((key) => print(`${key}: ${stats[key]}`))
  }
}
