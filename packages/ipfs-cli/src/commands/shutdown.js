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

  /**
   * @param {object} argv
   * @param {import('../types').Context} argv.ctx
   * @param {number} argv.timeout
   */
  handler ({ ctx: { ipfs }, timeout }) {
    // @ts-ignore not part of the core api
    return ipfs.shutdown({
      timeout
    })
  }
}
