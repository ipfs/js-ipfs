'use strict'

const mafmt = require('mafmt')
const multiaddr = require('multiaddr')
const utils = require('../../utils')
const print = require('../../utils').print

module.exports = {
  command: 'peers',

  describe: 'List peers with open connections',

  builder: {},

  handler (argv) {
    if (!utils.isDaemonOn()) {
      throw new Error('This command must be run in online mode. Try running \'ipfs daemon\' first.')
    }

    argv.ipfs.swarm.peers((err, result) => {
      if (err) {
        throw err
      }

      result.forEach((item) => {
        let ma = multiaddr(item.addr.toString())
        if (!mafmt.IPFS.matches(ma)) {
          ma = ma.encapsulate('/ipfs/' + item.peer.toB58String())
        }
        const addr = ma.toString()
        print(addr)
      })
    })
  }
}
