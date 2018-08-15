'use strict'

const debug = require('debug')
const log = debug('cli:object')
log.error = debug('cli:object:error')
const print = require('../../../utils').print

module.exports = {
  command: 'rm-link <root> <link>',

  describe: 'Remove a link from an object',

  builder: {},

  handler (argv) {
    argv.ipfs.object.patch.rmLink(argv.root, { name: argv.link }, {
      enc: 'base58'
    }, (err, node) => {
      if (err) {
        throw err
      }

      const nodeJSON = node.toJSON()

      print(nodeJSON.multihash)
    })
  }
}
