'use strict'

const parseDuration = require('parse-duration')

module.exports = {
  command: 'refs-local',

  describe: 'List all local references.',

  builder: {
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print }, timeout }) {
    for await (const ref of ipfs.refs.local({
      timeout
    })) {
      if (ref.err) {
        print(ref.err, true, true)
      } else {
        print(ref.ref)
      }
    }
  }
}
