import parseDuration from 'parse-duration'
import { coerceCID } from '../../utils.js'

export default {
  command: 'unwant <key>',

  describe: 'Removes a given block from your wantlist.',

  builder: {
    key: {
      alias: 'k',
      describe: 'Key to remove from your wantlist',
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
   * @param {import('../../types').Context} argv.ctx
   * @param {import('multiformats/cid').CID} argv.key
   * @param {string} argv.cidBase
   * @param {number} argv.timeout
   */
  async handler ({ ctx, key, cidBase, timeout }) {
    const { ipfs, print } = ctx
    const base = await ipfs.bases.getBase(cidBase)
    await ipfs.bitswap.unwant(key, {
      timeout
    })
    print(`Key ${key.toString(base.encoder)} removed from wantlist`)
  }
}
