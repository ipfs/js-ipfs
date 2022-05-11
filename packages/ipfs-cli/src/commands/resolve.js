import parseDuration from 'parse-duration'
import {
  stripControlCharacters
} from '../utils.js'

/**
 * @typedef {object} Argv
 * @property {import('../types').Context} Argv.ctx
 * @property {string} Argv.name
 * @property {boolean} Argv.recursive
 * @property {string} Argv.cidBase
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'resolve <name>',

  describe: 'Resolve the value of names to IPFS',

  builder: {
    recursive: {
      alias: 'r',
      boolean: true,
      default: true
    },
    'cid-base': {
      describe: 'Number base to display CIDs in',
      string: true,
      default: 'base58btc'
    },
    timeout: {
      string: true,
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { print, ipfs }, name, recursive, cidBase, timeout }) {
    const res = await ipfs.resolve(name, { recursive, cidBase, timeout })
    print(stripControlCharacters(res))
  }
}

export default command
