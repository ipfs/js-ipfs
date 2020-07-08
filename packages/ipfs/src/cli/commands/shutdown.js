'use strict'

const parseDuration = require('parse-duration').default

module.exports = {
  command: 'shutdown',

  describe: 'Shut down the ipfs daemon',

  builder: {
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  handler ({ ctx: { ipfs }, timeout }) {
    return ipfs.shutdown({
      timeout
    })
  }
}
