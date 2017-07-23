'use strict'

const print = require('../../utils').print

module.exports = {
  command: 'wantlist',

  describe: 'Print out all blocks currently on the bitswap wantlist for the local peer.',

  builder: {
    peer: {
      alias: 'p',
      describe: 'Specify which peer to show wantlist for.',
      type: 'string'
    }
  },

  handler (argv) {
    // TODO: handle argv.peer
    argv.ipfs.bitswap.wantlist((err, res) => {
      if (err) {
        throw err
      }
      res.Keys.forEach((cidStr) => {
        print(cidStr)
      })
    })
  }
}
