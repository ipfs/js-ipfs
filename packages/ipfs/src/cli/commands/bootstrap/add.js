'use strict'

const parseDuration = require('parse-duration')

module.exports = {
  command: 'add [<peer>]',

  describe: 'Add peers to the bootstrap list',

  builder: {
    default: {
      describe: 'Add default bootstrap nodes.',
      type: 'boolean',
      default: false
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print }, peer, default: defaultPeers, timeout }) {
    const list = await ipfs.bootstrap.add(peer, {
      default: defaultPeers,
      timeout
    })
    list.Peers.forEach((peer) => print(peer))
  }
}
