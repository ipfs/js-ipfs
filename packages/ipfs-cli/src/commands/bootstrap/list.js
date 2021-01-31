'use strict'

const { default: parseDuration } = require('parse-duration')

module.exports = {
  command: 'list',

  describe: 'Show peers in the bootstrap list',

  builder: {
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print }, timeout }) {
    const list = await ipfs.bootstrap.list({
      timeout
    })
    list.Peers.forEach((node) => print(node))
  }
}
