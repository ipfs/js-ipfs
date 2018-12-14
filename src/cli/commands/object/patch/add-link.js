'use strict'

const dagPB = require('ipld-dag-pb')
const DAGLink = dagPB.DAGLink
const multibase = require('multibase')
const { print } = require('../../../utils')
const { cidToString } = require('../../../../utils/cid')

module.exports = {
  command: 'add-link <root> <name> <ref>',

  describe: 'Add a link to a given object',

  builder: {
    'cid-base': {
      describe: 'Number base to display CIDs in. Note: specifying a CID base for v0 CIDs will have no effect.',
      type: 'string',
      choices: multibase.names
    }
  },

  handler ({ ipfs, root, name, ref, cidBase }) {
    ipfs.object.get(ref, { enc: 'base58' }, (err, nodeA) => {
      if (err) {
        throw err
      }

      dagPB.util.cid(nodeA, (err, result) => {
        if (err) {
          throw err
        }

        const link = new DAGLink(name, nodeA.size, result)

        ipfs.object.patch.addLink(root, link, {
          enc: 'base58'
        }, (err, cid) => {
          if (err) {
            throw err
          }

          print(cidToString(cid, { base: cidBase, upgrade: false }))
        })
      })
    })
  }
}
