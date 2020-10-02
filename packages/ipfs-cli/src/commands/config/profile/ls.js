'use strict'

const parseDuration = require('parse-duration').default

module.exports = {
  command: 'ls',

  describe: 'List available config profiles',

  builder: {
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print }, timeout }) {
    for (const profile of await ipfs.config.profiles.list({
      timeout
    })) {
      print(`${profile.name}:\n ${profile.description}`)
    }
  }
}
