'use strict'

const utils = require('../../utils')
const debug = require('debug')
const mafmt = require('mafmt')
const multiaddr = require('multiaddr')
const log = debug('cli:object')
log.error = debug('cli:object:error')

module.exports = {
  command: 'peers',

  describe: 'List peers with open connections',

  builder: {},

  handler (argv) {
    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }

      if (!utils.isDaemonOn()) {
        throw new Error('This command must be run in online mode. Try running \'ipfs daemon\' first.')
      }

      ipfs.swarm.peers((err, result) => {
        if (err) {
          throw err
        }

        result.forEach((item) => {
          let ma = multiaddr(item.addr.toString())
          if (!mafmt.IPFS.matches(ma)) {
            ma = ma.encapsulate('/ipfs/' + item.peer.toB58String())
          }
          const addr = ma.toString()
          console.log(addr)
        })
      })
    })
  }
}
