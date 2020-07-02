'use strict'

const dagPB = require('ipld-dag-pb')
const DAGLink = dagPB.DAGLink
const multibase = require('multibase')
const { cidToString } = require('../../../../utils/cid')
const parseDuration = require('parse-duration').default

module.exports = {
  command: 'add-link <root> <name> <ref>',

  describe: 'Add a link to a given object',

  builder: {
    'cid-base': {
      describe: 'Number base to display CIDs in. Note: specifying a CID base for v0 CIDs will have no effect.',
      type: 'string',
      choices: Object.keys(multibase.names)
    },
    'cid-version': {
      describe: 'The CID version of the DAGNode to link to',
      type: 'number',
      default: 0
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print }, root, name, ref, cidBase, cidVersion, timeout }) {
    const nodeA = await ipfs.object.get(ref, { enc: 'base58', timeout })
    const result = await dagPB.util.cid(dagPB.util.serialize(nodeA), {
      cidVersion
    })
    const link = new DAGLink(name, nodeA.size, result)
    const cid = await ipfs.object.patch.addLink(root, link, { enc: 'base58', timeout })
    print(cidToString(cid, { base: cidBase, upgrade: false }))
  }
}
