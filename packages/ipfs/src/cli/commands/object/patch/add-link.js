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

  handler ({ getIpfs, print, root, name, ref, cidBase, cidVersion, resolve }) {
    resolve((async () => {
      const ipfs = await getIpfs()
      const nodeA = await ipfs.object.get(ref, { enc: 'base58' })
      const result = await dagPB.util.cid(dagPB.util.serialize(nodeA), {
        cidVersion
      })
      const link = new DAGLink(name, nodeA.size, result)
      const cid = await ipfs.object.patch.addLink(root, link, { enc: 'base58' })
      print(cidToString(cid, { base: cidBase, upgrade: false }))
    })())
  }
}
