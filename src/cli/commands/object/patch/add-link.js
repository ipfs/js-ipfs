'use strict'

const utils = require('../../../utils')
const debug = require('debug')
const log = debug('cli:object')
const dagPB = require('ipld-dag-pb')
const DAGLink = dagPB.DAGLink
const series = require('async/series')
log.error = debug('cli:object:error')

module.exports = {
  command: 'add-link <root> <name> <ref>',

  describe: 'Add a link to a given object',

  builder: {},

  handler (argv) {
    let ipfs
    let nodeA
    let nodeB

    series([
      (cb) => {
        utils.getIPFS((err, _ipfs) => {
          if (err) {
            return cb(err)
          }
          ipfs = _ipfs
          cb()
        })
      },
      (cb) => {
        ipfs.object.get(argv.ref, {enc: 'base58'}, (err, node) => {
          if (err) {
            return cb(err)
          }
          nodeA = node
          cb()
        })
      },
      (cb) => {
        const link = new DAGLink(argv.name, nodeA.size, nodeA.multihash)

        ipfs.object.patch.addLink(argv.root, link, {enc: 'base58'}, (err, node) => {
          if (err) {
            return cb(err)
          }
          nodeB = node
          cb()
        })
      }
    ], (err) => {
      if (err) {
        throw err
      }

      console.log(nodeB.toJSON().multihash)
    })
  }
}
