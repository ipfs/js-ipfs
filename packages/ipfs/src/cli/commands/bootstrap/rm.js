'use strict'

const debug = require('debug')
const log = debug('cli:bootstrap')
log.error = debug('cli:bootstrap:error')
const parseDuration = require('parse-duration')

module.exports = {
  command: 'rm [<peer>]',

  describe: 'Removes peers from the bootstrap list',

  builder: {
    all: {
      type: 'boolean',
      describe: 'Remove all bootstrap peers.',
      default: false
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print }, all, peer, timeout }) {
    const list = await ipfs.bootstrap.rm(peer, {
      all,
      timeout
    })
    list.Peers.forEach((peer) => print(peer))
  }
}
