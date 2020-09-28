'use strict'

const parseDuration = require('parse-duration').default

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
    let list

    if (peer) {
      list = await ipfs.bootstrap.add(peer, {
        timeout
      })
    } else if (defaultPeers) {
      list = await ipfs.bootstrap.reset({
        timeout
      })
    } else {
      throw new Error('Please specify a peer or the --default flag')
    }

    list.Peers.forEach((peer) => print(peer))
  }
}
