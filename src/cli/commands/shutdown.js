'use strict'

module.exports = {
  command: 'shutdown',

  describe: 'Shut down the ipfs daemon',

  builder: {},

  handler (argv) {
    argv.ipfs.stop((err) => {
      if (err) {
        throw err
      }
      // if (argv.onComplete) argv.onComplete()
    })
  }
}
