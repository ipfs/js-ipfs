import parseDuration from 'parse-duration'

/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {boolean} Argv.quiet
 * @property {boolean} Argv.streamErrors
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'gc',

  describe: 'Perform a garbage collection sweep on the repo',

  builder: {
    quiet: {
      alias: 'q',
      desc: 'Write minimal output',
      boolean: true,
      default: false
    },
    'stream-errors': {
      desc: 'Output individual errors thrown when deleting blocks',
      boolean: true,
      default: true
    },
    timeout: {
      string: true,
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print }, quiet, streamErrors, timeout }) {
    for await (const r of ipfs.repo.gc({
      timeout
    })) {
      if (r.err != null) {
        streamErrors && print(r.err.message, true, true)
      } else {
        print((quiet ? '' : 'removed ') + r.cid)
      }
    }
  }
}

export default command
