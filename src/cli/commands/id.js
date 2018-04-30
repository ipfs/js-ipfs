'use strict'

const {print, getNodeOrAPI} = require('../utils')

module.exports = {
  command: 'id',

  describe: 'Shows IPFS Node ID info',

  builder: {
    format: {
      alias: 'f',
      type: 'string'
    }
  },

  handler (argv) {
    // TODO: handle argv.format
    return getNodeOrAPI(argv)
      .then(node => Promise.all([Promise.resolve(node), node.id()]))
      .then(([node, id]) => {
        print(JSON.stringify(id, '', 2))
        node.stop()
      })
  }
}
