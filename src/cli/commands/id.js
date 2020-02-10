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

  async handler ({ ctx }) {
    const { ipfs } = ctx
    const id = await ipfs.id()
    return JSON.stringify(id, '', 2)
  }
}
