'use strict'

const parseDuration = require('parse-duration').default

module.exports = {
  command: 'version',

  describe: 'Shows IPFS repo version information',

  builder: {
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print }, timeout }) {
    const version = await ipfs.repo.version({
      timeout
    })
    print(version)
  }
}
