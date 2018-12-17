'use strict'

const { print, isDaemonOn } = require('../../utils')

module.exports = {
  command: 'rm <key>',

  describe: 'Remove a raw IPFS block',

  builder: {},

  handler ({ ipfs, key }) {
    if (isDaemonOn()) {
      // TODO implement this once `js-ipfs-http-client` supports it
      throw new Error('rm block with daemon running is not yet implemented')
    }

    ipfs.block.rm(key, (err) => {
      if (err) {
        throw err
      }

      print('removed ' + key)
    })
  }
}
