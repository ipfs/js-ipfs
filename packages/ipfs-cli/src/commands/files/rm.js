import {
  asBoolean
} from '../../utils.js'
import parseDuration from 'parse-duration'

/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {string} Argv.path
 * @property {boolean} Argv.recursive
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'rm <path>',

  describe: 'Remove an mfs file or directory',

  builder: {
    recursive: {
      alias: 'r',
      boolean: true,
      default: false,
      coerce: asBoolean,
      describe: 'Remove directories recursively'
    },
    timeout: {
      string: true,
      coerce: parseDuration
    }
  },

  async handler ({
    ctx: { ipfs },
    path,
    recursive,
    timeout
  }) {
    await ipfs.files.rm(path, {
      recursive,
      timeout
    })
  }
}

export default command
