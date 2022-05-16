import parseDuration from 'parse-duration'
import { coerceCIDs } from '../../utils.js'

/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {import('multiformats/cid').CID[]} Argv.hash
 * @property {boolean} Argv.force
 * @property {boolean} Argv.quiet
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'rm <hash...>',

  describe: 'Remove IPFS block(s)',

  builder: {
    hash: {
      type: 'array',
      coerce: coerceCIDs
    },
    force: {
      alias: 'f',
      describe: 'Ignore nonexistent blocks',
      boolean: true,
      default: false
    },
    quiet: {
      alias: 'q',
      describe: 'Write minimal output',
      boolean: true,
      default: false
    },
    timeout: {
      string: true,
      coerce: parseDuration
    }
  },

  async handler ({ ctx, hash, force, quiet, timeout }) {
    const { ipfs, print } = ctx

    let errored = false

    for await (const result of ipfs.block.rm(hash, {
      force,
      quiet,
      timeout
    })) {
      if (result.error) {
        errored = true
      }

      if (!quiet) {
        print(result.error ? result.error.message : `removed ${result.cid}`)
      }
    }

    if (errored && !quiet) {
      throw new Error('some blocks not removed')
    }
  }
}

export default command
