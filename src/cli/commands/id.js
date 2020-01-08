'use strict'

module.exports = {
  command: 'id',

  describe: 'Shows IPFS Node ID info',

  builder: {
    format: {
      alias: 'f',
      type: 'string'
    }
  },

  async handler ({ ipfs }) {
    const id = await ipfs.api.id()
    return JSON.stringify(id, '', 2)
  }
}
