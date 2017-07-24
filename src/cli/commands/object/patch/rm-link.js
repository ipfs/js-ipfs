'use strict'

const DAGLink = require('ipld-dag-pb').DAGLink
const debug = require('debug')
const log = debug('cli:object')
log.error = debug('cli:object:error')
const print = require('../../../utils').print

module.exports = {
  command: 'rm-link <root> <link>',

  describe: 'Remove a link from an object',

  builder: {},

  handler (argv) {
    // TODO rmLink should support removing by name and/or multihash
    // without having to know everything, which in fact it does, however,
    // since it expectes a DAGLink type, we have to pass some fake size and
    // hash.
    const link = new DAGLink(argv.link, 1, 'Qm')
    argv.ipfs.object.patch.rmLink(argv.root, link, {
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
