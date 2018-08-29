'use strict'

const dagPB = require('ipld-dag-pb')
const DAGLink = dagPB.DAGLink
const CID = require('cids')
const multibase = require('multibase')
const { print } = require('../../../utils')
const { cidToString } = require('../../../../utils/cid')

module.exports = {
  command: 'add-link <root> <name> <ref>',

  describe: 'Add a link to a given object',

  builder: {
    'cid-base': {
      describe: 'Number base to display CIDs in.',
      type: 'string',
      choices: multibase.names
    }
  },

  handler (argv) {
    const ipfs = argv.ipfs
    ipfs.object.get(argv.ref, {
      enc: 'base58'
    }, (err, nodeA) => {
      if (err) {
        throw err
      }

      const link = new DAGLink(argv.name, nodeA.size, nodeA.multihash)

      ipfs.object.patch.addLink(argv.root, link, {
        enc: 'base58'
      }, (err, nodeB) => {
        if (err) {
          throw err
        }

        print(cidToString(new CID(nodeB.multihash), argv.cidBase))
      })
    })
  }
}
