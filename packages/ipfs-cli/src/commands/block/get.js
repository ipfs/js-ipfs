import parseDuration from 'parse-duration'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { coerceCID } from '../../utils.js'

/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {import('multiformats/cid').CID} Argv.key
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'get <key>',

  describe: 'Get a raw IPFS block',

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

export default command
