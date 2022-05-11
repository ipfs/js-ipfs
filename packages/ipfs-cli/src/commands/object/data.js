import parseDuration from 'parse-duration'
import { coerceCID } from '../../utils.js'

/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {import('multiformats/cid').CID} Argv.key
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'data <key>',

  describe: 'Outputs the raw bytes in an IPFS object',

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
    const data = await ipfs.object.data(key, { timeout })
    print(data, false)
  }
}

export default command
