'use strict'

const DAGLink = require('ipfs-merkle-dag').DAGLink
const utils = require('../../../utils')
const debug = require('debug')
const log = debug('cli:object')
log.error = debug('cli:object:error')

module.exports = {
  command: 'rm-link <root> <link>',

  describe: 'Remove a link from an object',

  builder: {},

  handler (argv) {
    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }

      const dLink = new DAGLink(argv.link)

      ipfs.object.patch.rmLink(argv.root, dLink, {enc: 'base58'}, (err, node) => {
        if (err) {
          throw err
        }

        console.log(node.toJSON().Hash)
      })
    })
  }
}
