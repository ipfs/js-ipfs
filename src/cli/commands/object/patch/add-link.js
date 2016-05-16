'use strict'

const Command = require('ronin').Command
const utils = require('../../../utils')
const debug = require('debug')
const log = debug('cli:object')
const mDAG = require('ipfs-merkle-dag')
const DAGLink = mDAG.DAGLink
log.error = debug('cli:object:error')

module.exports = Command.extend({
  desc: 'Add a link to a given object',

  options: {},

  run: (root, name, ref) => {
    if (!root) {
      throw new Error("Argument 'root' is required")
    }
    if (!name) {
      throw new Error("Argument 'name' is required")
    }
    if (!ref) {
      throw new Error("Argument 'ref' is required")
    }

    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }

      ipfs.object.get(ref, {enc: 'base58'}).then((linkedObj) => {
        const link = new DAGLink(
          name,
          linkedObj.size(),
          linkedObj.multihash()
        )
        return ipfs.object.patch.addLink(root, link, {enc: 'base58'})
      }).then((node) => {
        console.log(node.toJSON().Hash)
      }).catch((err) => {
        throw err
      })
    })
  }
})
