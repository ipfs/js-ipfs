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

  async handler ({ ctx, all, peer }) {
    const { ipfs, print } = ctx
    const list = await ipfs.bootstrap.rm(peer, { all })
    list.Peers.forEach((peer) => print(peer))
  }
}
