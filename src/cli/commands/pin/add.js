'use strict'

const print = require('../../utils').print

module.exports = {
  command: 'add <ipfs-path>',

  describe: 'Pins objects to local storage.',

  builder: {
    recursive: {
      type: 'boolean',
      alias: 'r',
      default: true,
      describe: 'Recursively pin the object linked to by the specified object(s).'
    }
  },

  handler (argv) {
    const paths = argv['ipfs-path'].split(' ')
    const recursive = argv.recursive
    const type = recursive ? 'recursive' : 'direct'
    argv.ipfs.pin.add(paths[0], { recursive: recursive }, (err, results) => {
      if (err) { throw err }
      results.forEach((res) => {
        print(`pinned ${res.hash} ${type}ly`)
      })
    })
  }
}
