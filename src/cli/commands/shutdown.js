'use strict'

module.exports = {
  command: 'shutdown',

  describe: 'Shut down the ipfs daemon',

  builder: {},

  handler (argv) {
    argv.resolve(argv.ipfs.shutdown())
  }
}
