import parseDuration from 'parse-duration'

export default {
  command: 'gc',

  describe: 'Perform a garbage collection sweep on the repo.',

  builder: {
    quiet: {
      alias: 'q',
      desc: 'Write minimal output',
      type: 'boolean',
      default: false
    },
    'stream-errors': {
      desc: 'Output individual errors thrown when deleting blocks.',
      type: 'boolean',
      default: true
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  /**
   * @param {object} argv
   * @param {import('../../types').Context} argv.ctx
   * @param {boolean} argv.quiet
   * @param {boolean} argv.streamErrors
   * @param {number} argv.timeout
   */
  async handler ({ ctx: { ipfs, print }, quiet, streamErrors, timeout }) {
    for await (const r of ipfs.repo.gc({
      timeout
    })) {
      // @ts-ignore cannot derive type
      if (r.err != null) {
        // @ts-ignore cannot derive type
        streamErrors && print(r.err.message, true, true)
      } else {
        // @ts-ignore cannot derive type
        print((quiet ? '' : 'removed ') + r.cid)
      }
    }
  }
}
