'use strict'

module.exports = {
  command: 'shutdown',

  describe: 'Shut down the ipfs daemon',

  handler (argv) {
    return argv.ctx.ipfs.shutdown()
  }
}
