import parseDuration from 'parse-duration'
import { coerceCID } from '../../../utils.js'

export default {
  command: 'rm-link <root> <link>',

  describe: 'Remove a link from an object',

  builder: {
    root: {
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
   * @param {string} argv.link
   * @param {string} argv.cidBase
   * @param {number} argv.timeout
   */
  async handler ({ ctx: { ipfs, print }, root, link, cidBase, timeout }) {
    const cid = await ipfs.object.patch.rmLink(root, link, {
      timeout
    })
    const base = await ipfs.bases.getBase(cidBase)

    print(cid.toString(base.encoder))
  }
}
