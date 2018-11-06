'use strict'

const print = require('../../utils').print

module.exports = {
  command: 'query <peerID>',

  describe: 'Find the closest Peer IDs to a given Peer ID by querying the DHT.',

  builder: {},

  handler (argv) {
    argv.ipfs.dht.query(argv.peerID, (err, result) => {
      if (err) {
        throw err
      }

      result.forEach((element) => {
        print(element.ID)
      })
    })
  }
}
