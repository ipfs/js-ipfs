import parseDuration from 'parse-duration'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { coerceCID } from '../../utils.js'

export default {
  command: 'get <key>',

  describe: 'Get a raw IPFS block',

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
  async handler ({ ctx, key, timeout }) {
    const { ipfs, print } = ctx
    const block = await ipfs.block.get(key, {
      timeout
    })
    if (block) {
      print(uint8ArrayToString(block), false)
    } else {
      print('Block was unwanted before it could be remotely retrieved')
    }
  }
}
