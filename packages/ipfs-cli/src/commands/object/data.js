import parseDuration from 'parse-duration'
import { coerceCID } from '../../utils.js'

export default {
  command: 'data <key>',

  describe: 'Outputs the raw bytes in an IPFS object',

  builder: {
    key: {
      type: 'string',
      coerce: coerceCID
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
   * @param {number} argv.timeout
   */
  async handler ({ ctx: { ipfs, print }, key, timeout }) {
    const data = await ipfs.object.data(key, { timeout })
    print(data, false)
  }
}
