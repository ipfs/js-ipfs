'use strict'

const mafmt = require('mafmt')
const multiaddr = require('multiaddr')
const parseDuration = require('parse-duration')

module.exports = {
  command: 'peers',

  describe: 'List peers with open connections',

  builder: {
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { print, ipfs, isDaemon }, timeout }) {
    if (!isDaemon) {
      throw new Error('This command must be run in online mode. Try running \'ipfs daemon\' first.')
    }

    const result = await ipfs.swarm.peers({
      timeout
    })

    result.forEach((item) => {
      let ma = multiaddr(item.addr.toString())
      if (!mafmt.IPFS.matches(ma)) {
        ma = ma.encapsulate('/ipfs/' + item.peer.toB58String())
      }
      const addr = ma.toString()
      print(addr)
    })
  }
}
