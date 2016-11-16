'use strict'

const utils = require('../../../utils')
const debug = require('debug')
const log = debug('cli:object')
const dagPB = require('ipld-dag-pb')
const DAGLink = dagPB.DAGLink
const waterfall = require('async/waterfall')
const parallel = require('async/parallel')
log.error = debug('cli:object:error')

module.exports = {
  command: 'add-link <root> <name> <ref>',

  describe: 'Add a link to a given object',

  builder: {},

  handler (argv) {
    waterfall([
      (cb) => utils.getIPFS(cb),
      (ipfs, cb) => waterfall([
        (cb) => ipfs.object.get(argv.ref, {enc: 'base58'}, cb),
        (linkedObj, cb) => parallel([
          (cb) => linkedObj.size(cb),
          (cb) => linkedObj.multihash(cb)
        ], cb)
      ], (err, stats) => {
        if (err) {
          return cb(err)
        }

        const link = new DAGLink(argv.name, stats[0], stats[1])
        ipfs.object.patch.addLink(argv.root, link, {enc: 'base58'}, cb)
      }),
      (node, cb) => node.toJSON(cb)
    ], (err, node) => {
      if (err) {
        throw err
      }

      console.log(node.Hash)
    })
  }
}
