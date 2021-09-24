import * as dagPB from '@ipld/dag-pb'
import parseDuration from 'parse-duration'
import { coerceCID } from '../../../utils.js'

export default {
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
      default: 'base58btc'
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  /**
   * @param {object} argv
   * @param {import('../../../types').Context} argv.ctx
   * @param {import('multiformats/cid').CID} argv.root
   * @param {string} argv.name
   * @param {import('multiformats/cid').CID} argv.ref
   * @param {string} argv.cidBase
   * @param {number} argv.timeout
   */
  async handler ({ ctx: { ipfs, print }, root, name, ref, cidBase, timeout }) {
    const nodeA = await ipfs.object.get(ref, { timeout })
    const block = dagPB.encode(nodeA)
    const cid = await ipfs.object.patch.addLink(root, {
      Name: name,
      Hash: ref,
      Tsize: block.length
    }, { timeout })
    const base = await ipfs.bases.getBase(cidBase)
    print(cid.toString(base.encoder))
  }
}
