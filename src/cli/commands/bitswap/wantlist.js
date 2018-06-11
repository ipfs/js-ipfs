'use strict'

const print = require('../../utils').print

module.exports = {
  command: 'wantlist [peer]',

  describe: 'Print out all blocks currently on the bitswap wantlist for the local peer.',

  builder: {
    peer: {
      alias: 'p',
      describe: 'Specify which peer to show wantlist for.',
      type: 'string'
    }
  },

  handler (argv) {
    argv.ipfs.bitswap.wantlist(argv.peer, (err, res) => {
      if (err) {
        throw err
      }
      res.Keys.forEach((cid) => {
        print(cid['/'])
      })
    })
  }
}
