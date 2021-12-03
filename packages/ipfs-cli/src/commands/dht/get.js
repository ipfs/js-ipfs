import parseDuration from 'parse-duration'
import { coerceCID } from '../../utils.js'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'

export default {
  command: 'get <key>',

  describe: 'Given a key, query the routing system for its best value.',

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
    for await (const event of await ipfs.dht.get(key.bytes, {
      timeout
    })) {
      if (event.name === 'VALUE') {
        print(uint8ArrayToString(event.value, 'base58btc'))
      }
    }
  }
}
