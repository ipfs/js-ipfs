'use strict'

const { default: parseDuration } = require('parse-duration')

module.exports = {
  command: 'ls',

  describe: 'List available config profiles',

  builder: {
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  /**
   * @param {object} argv
   * @param {import('../../../types').Context} argv.ctx
   * @param {number} argv.timeout
   */
  async handler ({ ctx: { ipfs, print }, timeout }) {
    for (const profile of await ipfs.config.profiles.list({
      timeout
    })) {
      print(`${profile.name}:\n ${profile.description}`)
    }
  }
}
