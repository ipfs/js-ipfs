'use strict'

const print = require('../../utils').print

module.exports = {
  command: 'addrs',

  describe: '',

  builder (yargs) {
    return yargs
      .commandDir('addrs')
  },

  handler (argv) {
    argv.resolve((async () => {
      const ipfs = await argv.getIpfs()
      const res = await ipfs.swarm.addrs()
      res.forEach((peer) => {
        const count = peer.multiaddrs.size
        print(`${peer.id.toB58String()} (${count})`)

        peer.multiaddrs.forEach((addr) => {
          const res = addr.decapsulate('ipfs').toString()
          print(`\t${res}`)
        })
      })
    })())
  }
}
