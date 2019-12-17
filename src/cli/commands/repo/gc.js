'use strict'

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
    }
  },

  handler ({ getIpfs, print, quiet, streamErrors, resolve }) {
    resolve((async () => {
      const ipfs = await getIpfs()
      for await (const r of ipfs.repo.gc()) {
        if (r.err) {
          streamErrors && print(r.err.message, true, true)
        } else {
          print((quiet ? '' : 'removed ') + r.cid)
        }
      }
    })())
  }
}
