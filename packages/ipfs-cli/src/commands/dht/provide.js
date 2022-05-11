import parseDuration from 'parse-duration'
import { coerceCID } from '../../utils.js'

/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {import('multiformats/cid').CID} Argv.key
 * @property {boolean} Argv.recursive
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'provide <key>',

  describe: 'Announce to the network that you are providing given values',

  builder: {
    key: {
      string: true,
      coerce: coerceCID
    },
    recursive: {
      alias: 'r',
      describe: 'Recursively provide entire graph',
      default: false,
      boolean: true
    },
    timeout: {
      string: true,
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs }, key, recursive, timeout }) {
    await ipfs.dht.provide(key, {
      recursive,
      timeout
    })
  }
}

export default command
