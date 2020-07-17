'use strict'

const parseDuration = require('parse-duration').default

module.exports = {
  command: 'addrs',

  describe: '',

  builder (yargs) {
    return yargs
      .commandDir('addrs')
      .option('timeout', {
        type: 'string',
        coerce: parseDuration
      })
  },

  async handler ({ ctx: { ipfs, print }, timeout }) {
    const res = await ipfs.swarm.addrs({
      timeout
    })

    const output = res.map((peer) => {
      const count = peer.addrs.length
      const peerAddrs = [`${peer.id} (${count})`]

      peer.addrs.map((addr) => {
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
    print(output.join('\n'))
  }
}
