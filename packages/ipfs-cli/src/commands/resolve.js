import parseDuration from 'parse-duration'
import {
  stripControlCharacters
} from '../utils.js'

export default {
  command: 'resolve <name>',

  description: 'Resolve the value of names to IPFS',

  builder: {
    recursive: {
      alias: 'r',
      type: 'boolean',
      default: true
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
   * @param {import('../types').Context} argv.ctx
   * @param {string} argv.name
   * @param {boolean} argv.recursive
   * @param {string} argv.cidBase
   * @param {number} argv.timeout
   */
  async handler ({ ctx: { print, ipfs }, name, recursive, cidBase, timeout }) {
    const res = await ipfs.resolve(name, { recursive, cidBase, timeout })
    print(stripControlCharacters(res))
  }
}
