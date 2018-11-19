'use strict'

const print = require('../../utils').print

module.exports = {
  command: 'add <ipfsPath...>',

  describe: 'Pins object to local storage.',

  builder: {
    'ipfs-path': {}, // Temporary fix for https://github.com/yargs/yargs-parser/issues/151
    recursive: {
      type: 'boolean',
      alias: 'r',
      default: true,
      describe: 'Recursively pin the object linked to by the specified object(s).'
    }
  },

  handler (argv) {
    const recursive = argv.recursive
    const type = recursive ? 'recursive' : 'direct'
    argv.ipfs.pin.add(argv.ipfsPath, { recursive: recursive }, (err, results) => {
      if (err) { throw err }
      results.forEach((res) => {
        print(`pinned ${res.hash} ${type}ly`)
      })
    })
  }
}
