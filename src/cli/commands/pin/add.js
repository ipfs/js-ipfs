'use strict'

const multibase = require('multibase')
const { print } = require('../../utils')

module.exports = {
  command: 'add <ipfsPath...>',

  describe: 'Pins object to local storage.',

  builder: {
    recursive: {
      type: 'boolean',
      alias: 'r',
      default: true,
      describe: 'Recursively pin the object linked to by the specified object(s).'
    },
    'cid-base': {
      describe: 'Number base to display CIDs in.',
      type: 'string',
      choices: multibase.names
    }
  },

  handler (argv) {
    const { recursive, cidBase } = argv
    const type = recursive ? 'recursive' : 'direct'

    argv.ipfs.pin.add(argv.ipfsPath, { recursive, cidBase }, (err, results) => {
      if (err) { throw err }
      results.forEach((res) => {
        print(`pinned ${res.hash} ${type}ly`)
      })
    })
  }
}
