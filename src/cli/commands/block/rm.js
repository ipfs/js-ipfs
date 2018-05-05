'use strict'

module.exports = {
  command: 'rm <key>',

  describe: 'Remove a raw IPFS block',

  builder: {},

  handler (argv) {
    const utils = require('../../utils')
    const print = utils.print
    const mh = require('multihashes')
    if (utils.isDaemonOn()) {
      // TODO implement this once `js-ipfs-api` supports it
      throw new Error('rm block with daemon running is not yet implemented')
    }

    argv.ipfs.block.del(mh.fromB58String(argv.key), (err) => {
      if (err) {
        throw err
      }

      print('removed ' + argv.key)
    })
  }
}
