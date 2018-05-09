'use strict'

module.exports = {
  command: 'addrs',

  describe: '',

  builder (yargs) {
    return yargs
      .commandDir('addrs')
  },

  handler (argv) {
    const print = require('../../utils').print

    argv.ipfs.swarm.addrs((err, res) => {
      if (err) {
        throw err
      }

      res.forEach((peer) => {
        const count = peer.multiaddrs.size
        print(`${peer.id.toB58String()} (${count})`)

        peer.multiaddrs.forEach((addr) => {
          const res = addr.decapsulate('ipfs').toString()
          print(`\t${res}`)
        })
      })
    })
  }
}
