'use strict'

const dagPB = require('ipld-dag-pb')
const DAGLink = dagPB.DAGLink
const print = require('../../../utils').print
const {
  util: {
    cid
  }
} = require('ipld-dag-pb')

module.exports = {
  command: 'add-link <root> <name> <ref>',

  describe: 'Add a link to a given object',

  builder: {
    'cid-base': {
      default: 'base58btc',
      describe: 'CID base to use.'
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

      cid(nodeA, (err, result) => {
        if (err) {
          throw err
        }

        const link = new DAGLink(argv.name, nodeA.size, result)

        ipfs.object.patch.addLink(argv.root, link, {
          enc: 'base58'
        }, (err, nodeB) => {
          if (err) {
            throw err
          }

          cid(nodeB, (err, result) => {
            if (err) {
              throw err
            }

            print(result.toBaseEncodedString(argv.cidBase))
          })
        })
      })
    })
  }
}
