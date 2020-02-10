'use strict'

const mafmt = require('mafmt')
const multiaddr = require('multiaddr')

module.exports = {
  command: 'peers',

  describe: 'List peers with open connections',

  async handler ({ ctx }) {
    const { print, ipfs, isDaemon } = ctx
    if (!isDaemon) {
      throw new Error('This command must be run in online mode. Try running \'ipfs daemon\' first.')
    }

    const result = await ipfs.swarm.peers()

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
