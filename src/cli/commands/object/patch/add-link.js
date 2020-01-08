'use strict'

const dagPB = require('ipld-dag-pb')
const DAGLink = dagPB.DAGLink
const multibase = require('multibase')
const { cidToString } = require('../../../../utils/cid')

module.exports = {
  command: 'add-link <root> <name> <ref>',

  describe: 'Add a link to a given object',

  builder: {
    'cid-base': {
      describe: 'Number base to display CIDs in. Note: specifying a CID base for v0 CIDs will have no effect.',
      type: 'string',
      choices: multibase.names
    },
    'cid-version': {
      describe: 'The CID version of the DAGNode to link to',
      type: 'number',
      default: 0
    }
  },

  async handler ({ ipfs, print, root, name, ref, cidBase, cidVersion }) {
    const nodeA = await ipfs.api.object.get(ref, { enc: 'base58' })
    const result = await dagPB.util.cid(dagPB.util.serialize(nodeA), {
      cidVersion
    })
    const link = new DAGLink(name, nodeA.size, result)
    const cid = await ipfs.api.object.patch.addLink(root, link, { enc: 'base58' })
    print(cidToString(cid, { base: cidBase, upgrade: false }))
  }
}
