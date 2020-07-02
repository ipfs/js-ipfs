'use strict'

const parseDuration = require('parse-duration').default

module.exports = {
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

  async handler ({ ctx: { ipfs, print }, quiet, streamErrors, timeout }) {
    for await (const r of ipfs.repo.gc({
      timeout
    })) {
      if (r.err) {
        streamErrors && print(r.err.message, true, true)
      } else {
        print((quiet ? '' : 'removed ') + r.cid)
      }
    }
  }
}
