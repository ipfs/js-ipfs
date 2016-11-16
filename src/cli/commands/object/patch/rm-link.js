'use strict'

const DAGLink = require('ipld-dag-pb').DAGLink
const waterfall = require('async/waterfall')
const utils = require('../../../utils')
const debug = require('debug')
const log = debug('cli:object')
log.error = debug('cli:object:error')

module.exports = {
  command: 'rm-link <root> <link>',

  describe: 'Remove a link from an object',

  builder: {},

  handler (argv) {
    const dLink = new DAGLink(argv.link)

    waterfall([
      (cb) => utils.getIPFS(cb),
      (ipfs, cb) => ipfs.object.patch.rmLink(argv.root, dLink, {enc: 'base58'}, cb),
      (node, cb) => node.toJSON(cb)
    ], (err, node) => {
      if (err) {
        throw err
      }

      console.log(node.Hash)
    })
  }
}
