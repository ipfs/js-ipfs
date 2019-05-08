'use strict'

const { print } = require('../../utils')

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
      default: false
    }
  },

  handler ({ getIpfs, quiet, streamErrors, resolve }) {
    resolve((async () => {
      const ipfs = await getIpfs()
      const res = await ipfs.repo.gc()
      for (const r of res) {
        if (res.err) {
          streamErrors && print(res.err, true, true)
        } else {
          print((quiet ? '' : 'Removed ') + r.cid)
        }
      }
    })())
  }
}
