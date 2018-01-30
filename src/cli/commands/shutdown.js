'use strict'

module.exports = {
  command: 'shutdown',

  describe: 'Shut down the ipfs daemon',

  builder: {},

  handler (argv) {
    argv.ipfs.shutdown((err) => {
      if (err) {
        throw err
      }
    })
  }
}
