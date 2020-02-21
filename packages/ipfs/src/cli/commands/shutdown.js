'use strict'

module.exports = {
  command: 'shutdown',

  describe: 'Shut down the ipfs daemon',

  builder: {},

  handler (argv) {
    argv.resolve((async () => {
      const ipfs = await argv.getIpfs()
      return ipfs.shutdown()
    })())
  }
}
