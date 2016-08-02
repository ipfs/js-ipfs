'use strict'

const utils = require('../../../utils')
const debug = require('debug')
const log = debug('cli:object')
const mDAG = require('ipfs-merkle-dag')
const DAGLink = mDAG.DAGLink
log.error = debug('cli:object:error')

module.exports = {
  command: 'add-link <root> <name> <ref>',

  describe: 'Add a link to a given object',

  builder: {},

  handler (argv) {
    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }

      ipfs.object.get(argv.ref, {enc: 'base58'}).then((linkedObj) => {
        const link = new DAGLink(
          argv.name,
          linkedObj.size(),
          linkedObj.multihash()
        )
        return ipfs.object.patch.addLink(argv.root, link, {enc: 'base58'})
      }).then((node) => {
        console.log(node.toJSON().Hash)
      }).catch((err) => {
        throw err
      })
    })
  }
}
