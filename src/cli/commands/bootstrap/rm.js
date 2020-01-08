'use strict'

const debug = require('debug')
const log = debug('cli:bootstrap')
log.error = debug('cli:bootstrap:error')

module.exports = {
  command: 'rm [<peer>]',

  describe: 'Removes peers from the bootstrap list',

  builder: {
    all: {
      type: 'boolean',
      describe: 'Remove all bootstrap peers.',
      default: false
    }
  },

  async handler ({ ipfs, print, all, peer }) {
    const list = await ipfs.api.bootstrap.rm(peer, { all })
    list.Peers.forEach((peer) => print(peer))
  }
}
