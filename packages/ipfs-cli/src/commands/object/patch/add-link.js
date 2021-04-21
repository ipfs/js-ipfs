'use strict'

const dagPB = require('ipld-dag-pb')
const DAGLink = dagPB.DAGLink
const multibase = require('multibase')
const { cidToString } = require('ipfs-core-utils/src/cid')
const { default: parseDuration } = require('parse-duration')
const { coerceCID } = require('../../../utils')

module.exports = {
  command: 'add-link <root> <name> <ref>',

  describe: 'Add a link to a given object',

  builder: {
    root: {
      type: 'string',
      coerce: coerceCID
    },
    ref: {
      type: 'string',
      coerce: coerceCID
    },
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

  /**
   * @param {object} argv
   * @param {import('../../../types').Context} argv.ctx
   * @param {import('cids')} argv.root
   * @param {string} argv.name
   * @param {import('cids')} argv.ref
   * @param {import('multibase').BaseName} argv.cidBase
   * @param {import('cids').CIDVersion} argv.cidVersion
   * @param {number} argv.timeout
   */
  async handler ({ ctx: { ipfs, print }, root, name, ref, cidBase, cidVersion, timeout }) {
    const nodeA = await ipfs.object.get(ref, { timeout })
    const result = await dagPB.util.cid(dagPB.util.serialize(nodeA), {
      cidVersion
    })
    const link = new DAGLink(name, nodeA.size, result)
    const cid = await ipfs.object.patch.addLink(root, link, { timeout })
    print(cidToString(cid, { base: cidBase, upgrade: false }))
  }
}
