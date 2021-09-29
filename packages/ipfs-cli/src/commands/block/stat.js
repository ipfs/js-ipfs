import parseDuration from 'parse-duration'
import { coerceCID } from '../../utils.js'

export default {
  command: 'stat <key>',

  describe: 'Print information of a raw IPFS block',

  builder: {
    key: {
      type: 'string',
      coerce: coerceCID
    },
    'cid-base': {
      describe: 'Number base to display CIDs in.',
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
   * @param {import('../../types').Context} argv.ctx
   * @param {import('multiformats/cid').CID} argv.key
   * @param {string} argv.cidBase
   * @param {number} argv.timeout
   */
  async handler ({ ctx, key, cidBase, timeout }) {
    const { ipfs, print } = ctx
    const stats = await ipfs.block.stat(key, {
      timeout
    })
    const base = await ipfs.bases.getBase(cidBase)
    print('Key: ' + stats.cid.toString(base.encoder))
    print('Size: ' + stats.size)
  }
}
