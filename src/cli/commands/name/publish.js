'use strict'

const print = require('../../utils').print

module.exports = {
  command: 'publish <ipfsPath>',

  describe: 'Publish IPNS names.',

  builder: {
    format: {
      type: 'string'
    }
  },

  handler (argv) {
    argv.ipfs.name.publish(argv['ipfsPath'], (err, result) => {
      if (err) {
        throw err
      }

      print(`Published to ${result.name}: ${result.value}`)
    })
  }
}
