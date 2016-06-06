'use strict'

const Command = require('ronin').Command
const utils = require('../../utils')

module.exports = Command.extend({
  desc: 'Print out all blocks currently on the bitswap wantlist for the local peer.',

  options: {
  },

  run: () => {
    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }

      ipfs.bitswap.wantlist((err, res) => {
        if (err) {
          throw err
        }
        res.Keys.forEach((k) => console.log(k))
      })
    })
  }
})
