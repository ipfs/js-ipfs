'use strict'

const parseDuration = require('parse-duration').default

module.exports = {
  command: 'data <key>',

  describe: 'Outputs the raw bytes in an IPFS object',

  builder: {
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print }, key, timeout }) {
    const data = await ipfs.object.data(key, { enc: 'base58', timeout })
    print(data, false)
  }
}
