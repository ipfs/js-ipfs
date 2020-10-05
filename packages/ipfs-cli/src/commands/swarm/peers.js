'use strict'

const mafmt = require('mafmt')
const multiaddr = require('multiaddr')
const parseDuration = require('parse-duration').default

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
      let ma = multiaddr(`${item.addr}`)

      if (!mafmt.IPFS.matches(ma)) {
        ma = ma.encapsulate(`/ipfs/${item.peer}`)
      }

      print(`${ma}`)
    })
  }
}
