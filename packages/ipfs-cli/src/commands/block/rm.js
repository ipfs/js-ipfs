import parseDuration from 'parse-duration'
import { coerceCIDs } from '../../utils.js'

export default {
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
      type: 'boolean',
      default: false
    },
    quiet: {
      alias: 'q',
      describe: 'Write minimal output',
      type: 'boolean',
      default: false
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  /**
   * @param {object} argv
   * @param {import('../../types').Context} argv.ctx
   * @param {import('multiformats/cid').CID[]} argv.hash
   * @param {boolean} argv.force
   * @param {boolean} argv.quiet
   * @param {number} argv.timeout
   */
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
