'use strict'

module.exports = {
  command: 'addrs',

  describe: '',

  builder (yargs) {
    return yargs
      .commandDir('addrs')
  },

  async handler (argv) {
    const res = await argv.ipfs.api.swarm.addrs()

    const output = res.map((peer) => {
      const count = peer.multiaddrs.size
      const peerAddrs = [`${peer.id.toB58String()} (${count})`]

      peer.multiaddrs.toArray().map((addr) => {
        let res
        try {
          res = addr.decapsulate('ipfs').toString()
        } catch (_) {
          // peer addresses dont need to have /ipfs/ as we know their peerId
          // and can encapsulate on dial.
          res = addr.toString()
        }
        peerAddrs.push(`\t${res}`)
      })

      return peerAddrs.join('\n')
    })

    // Return the output for printing
    argv.print(output.join('\n'))
  }
}
