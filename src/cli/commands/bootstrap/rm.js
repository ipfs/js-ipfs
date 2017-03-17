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

  handler (argv) {
    argv.ipfs.bootstrap.rm(argv.peer, {
      all: argv.all
    }, (err, list) => {
      if (err) {
        throw err
      }

      list.Peers.forEach((l) => console.log(l))
    })
  }
}
