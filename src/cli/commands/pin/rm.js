'use strict'

const print = require('../../utils').print

module.exports = {
  command: 'rm <ipfsPath...>',

  describe: 'Removes the pinned object from local storage.',

  builder: {
    'ipfs-path': {}, // Temporary fix for https://github.com/yargs/yargs-parser/issues/151
    recursive: {
      type: 'boolean',
      alias: 'r',
      default: true,
      describe: 'Recursively unpin the objects linked to by the specified object(s).'
    }
  },

  handler: (argv) => {
    const recursive = argv.recursive
    argv.ipfs.pin.rm(argv.ipfsPath, { recursive: recursive }, (err, results) => {
      if (err) { throw err }
      results.forEach((res) => {
        print(`unpinned ${res.hash}`)
      })
    })
  }
}
