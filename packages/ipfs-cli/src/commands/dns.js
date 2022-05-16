import parseDuration from 'parse-duration'
import {
  stripControlCharacters
} from '../utils.js'

/**
 * @typedef {object} Argv
 * @property {import('../types').Context} Argv.ctx
 * @property {string} Argv.domain
 * @property {boolean} Argv.recursive
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'dns <domain>',

  describe: 'Resolve DNS links',

  builder: {
    recursive: {
      boolean: true,
      default: true,
      alias: 'r',
      desc: 'Resolve until the result is not a DNS link'
    },
    timeout: {
      string: true,
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print }, domain, recursive, timeout }) {
    const path = await ipfs.dns(domain, { recursive, timeout })
    print(stripControlCharacters(path))
  }
}

export default command
