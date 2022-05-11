import parseDuration from 'parse-duration'
import { coerceCID } from '../../utils.js'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'

/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {import('multiformats/cid').CID} Argv.key
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'get <key>',

  describe: 'Given a key, query the routing system for its best value',

  builder: {
    key: {
      string: true,
      coerce: coerceCID
    },
    timeout: {
      string: true,
      coerce: parseDuration
    }
  },

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

export default command
