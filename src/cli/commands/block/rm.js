'use strict'

module.exports = {
  command: 'rm <key>',

  describe: 'Remove a raw IPFS block',

  builder: {},

  handler ({ getIpfs, print, isDaemonOn, key, resolve }) {
    resolve((async () => {
      if (isDaemonOn()) {
        // TODO implement this once `js-ipfs-http-client` supports it
        throw new Error('rm block with daemon running is not yet implemented')
      }

      const ipfs = await getIpfs()
      await ipfs.block.rm(key)
      print('removed ' + key)
    })())
  }
}
