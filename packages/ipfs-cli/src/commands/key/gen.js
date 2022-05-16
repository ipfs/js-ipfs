import parseDuration from 'parse-duration'
import {
  stripControlCharacters
} from '../../utils.js'

/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {string} Argv.name
 * @property {string} Argv.type
 * @property {number} Argv.size
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'gen <name>',

  describe: 'Create a new key',

  builder: {
    type: {
      alias: 't',
      describe: 'type of the key to create',
      choices: ['rsa', 'ed25519'],
      default: 'ed25519'
    },
    size: {
      alias: 's',
      describe: 'size of the key to generate',
      default: 2048,
      number: true
    },
    timeout: {
      string: true,
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print }, name, type, size, timeout }) {
    const key = await ipfs.key.gen(name, {
      type: type.toLowerCase() === 'rsa' ? 'RSA' : 'Ed25519',
      size,
      timeout
    })
    print(`generated ${key.id} ${stripControlCharacters(key.name)}`)
  }
}

export default command
