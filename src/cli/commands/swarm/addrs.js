'use strict'

const utils = require('../../utils')
const debug = require('debug')
const log = debug('cli:object')
log.error = debug('cli:object:error')

module.exports = {
  command: 'addrs',

  describe: '',

  builder (yargs) {
    return yargs
      .commandDir('addrs')
  },

  handler (argv) {
    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }

      ipfs.swarm.addrs((err, res) => {
        if (err) {
          throw err
        }

        res.forEach((peer) => {
          const count = peer.multiaddrs.length
          console.log(`${peer.id.toB58String()} (${count})`)
          peer.multiaddrs.forEach((addr) => {
            const res = addr.decapsulate('ipfs').toString()
            console.log(`\t${res}`)
          })
        })
      })
    })
  }
}
