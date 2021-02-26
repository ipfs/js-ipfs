'use strict'

const { default: parseDuration } = require('parse-duration')

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
