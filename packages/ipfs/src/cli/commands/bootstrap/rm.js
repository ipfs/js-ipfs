'use strict'

const debug = require('debug')
const log = debug('cli:bootstrap')
log.error = debug('cli:bootstrap:error')
const parseDuration = require('parse-duration').default

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
    let list

    if (peer) {
      list = await ipfs.bootstrap.rm(peer, {
        timeout
      })
    } else if (all) {
      list = await ipfs.bootstrap.clear({
        timeout
      })
    } else {
      throw new Error('Please specify a peer or the --all flag')
    }

    list.Peers.forEach((peer) => print(peer))
  }
}
