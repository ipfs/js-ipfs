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
          let res
          try {
            res = addr.decapsulate('ipfs').toString()
          } catch (_) {
            // peer addresses dont need to have /ipfs/ as we know their peerId
            // and can encapsulate on dial.
            res = addr.toString()
          }
          print(`\t${res}`)
        })
      })
    })())
  }
}
