'use strict'

const utils = require('../../../utils')
const debug = require('debug')
const log = debug('cli:object')
const dagPB = require('ipld-dag-pb')
const DAGLink = dagPB.DAGLink
log.error = debug('cli:object:error')

module.exports = {
  command: 'add-link <root> <name> <ref>',

  describe: 'Add a link to a given object',

  builder: {},

  handler (argv) {
    utils.getIPFS(gotIPFS)

    function gotIPFS (err, ipfs) {
      if (err) {
        throw err
      }

      ipfs.object.get(argv.ref, {enc: 'base58'}).then((linkedObj) => {
        linkedObj.size((err, size) => {
          if (err) {
            throw err
          }
          linkedObj.multihash((err, multihash) => {
            if (err) {
              throw err
            }

            const link = new DAGLink(argv.name, size, multihash)

            ipfs.object.patch.addLink(argv.root, link, {enc: 'base58'})
            .then((node) => {
              node.toJSON(gotJSON)

              function gotJSON (err, nodeJSON) {
                if (err) {
                  throw err
                }
                console.log(nodeJSON.Hash)
              }
            })
          })
        })
      }).catch((err) => {
        throw err
      })
    }
  }
}
