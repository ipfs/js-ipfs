'use strict'

const print = require('../../utils').print

module.exports = {
  command: 'findpeer <peerID>',

  describe: 'Find the multiaddresses associated with a Peer ID.',

  builder: {},

  handler (argv) {
    argv.ipfs.dht.findPeer(argv.peerID, (err, result) => {
      if (err) {
        throw err
      }

      const addresses = result.multiaddrs.toArray().map((ma) => ma.toString())

      print(addresses)
    })
  }
}
