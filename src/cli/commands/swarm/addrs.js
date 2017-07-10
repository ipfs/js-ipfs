'use strict'

module.exports = {
  command: 'addrs',

  describe: '',

  builder (yargs) {
    return yargs
      .commandDir('addrs')
  },

  handler (argv) {
    argv.ipfs.swarm.addrs((err, res) => {
      if (err) {
        throw err
      }

      res.forEach((peer) => {
        const count = peer.multiaddrs.size
        console.log(`${peer.id.toB58String()} (${count})`)

        peer.multiaddrs.forEach((addr) => {
          const res = addr.decapsulate('ipfs').toString()
          console.log(`\t${res}`)
        })
      })
    })
  }
}
