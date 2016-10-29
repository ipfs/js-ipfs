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
    let node
    let nodeSize
    let nodeMultihash
    let nodePatched
    series([
      (cb) => {
        utils.getIPFS(gotIPFS)

        function gotIPFS (err, _ipfs) {
          if (err) {
            cb(err)
          }
          ipfs = _ipfs
          cb()
        }
      },
      (cb) => {
        ipfs.object.get(argv.ref, {enc: 'base58'}, (err, _node) => {
          if (err) {
            cb(err)
          }
          node = _node
          cb()
        })
      },
      (cb) => {
        node.size((err, size) => {
          if (err) {
            cb(err)
          }
          nodeSize = size
          cb()
        })
      },
      (cb) => {
        node.multihash((err, multihash) => {
          if (err) {
            cb(err)
          }
          nodeMultihash = multihash
          cb()
        })
      },
      (cb) => {
        const link = new DAGLink(argv.name, nodeSize, nodeMultihash)

        ipfs.object.patch.addLink(argv.root, link, {enc: 'base58'}, (err, node) => {
          if (err) {
            cb(err)
          }
          nodePatched = node
          cb()
        })
      }
    ], (err) => {
      if (err) {
        throw err
      }
      nodePatched.toJSON(gotJSON)

      function gotJSON (err, nodeJSON) {
        if (err) {
          throw err
        }
        console.log(nodeJSON.Hash)
      }
    })
  }
}
