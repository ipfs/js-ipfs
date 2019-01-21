'use strict'

const { print, isDaemonOn } = require('../../utils')

module.exports = {
  command: 'rm <key>',

  describe: 'Remove a raw IPFS block',

  builder: {},

  handler ({ ipfs, key, resolve }) {
    resolve((async () => {
      if (isDaemonOn()) {
        // TODO implement this once `js-ipfs-http-client` supports it
        throw new Error('rm block with daemon running is not yet implemented')
      }

      await ipfs.block.rm(key)
      print('removed ' + key)
    })())
  }
}
