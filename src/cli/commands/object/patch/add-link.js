'use strict'

const Command = require('ronin').Command
const utils = require('../../../utils')
const bs58 = require('bs58')
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

      if (utils.isDaemonOn()) {
        return ipfs.object.patch.addLink(root, name, ref, (err, obj) => {
          if (err) {
            log.error(err)
            throw err
          }

          console.log(obj.Hash)
        })
      }

      // when running locally we first need to get the ref object,
      // so we can create the link with the correct size
      const refMh = new Buffer(bs58.decode(ref))
      ipfs.object.get(refMh, (err, linkedObj) => {
        if (err) {
          log.error(err)
          throw err
        }

        const rootMh = new Buffer(bs58.decode(root))
        const link = new DAGLink(name, linkedObj.size(), linkedObj.multihash())
        ipfs.object.patch.addLink(rootMh, link, (err, obj) => {
          if (err) {
            log.error(err)
            throw err
          }

          console.log(bs58.encode(obj.multihash()).toString())
        })
      })
    })
  }
})
