'use strict'

const multibase = require('multibase')
const { print } = require('../../utils')

module.exports = {
  // bracket syntax with '...' tells yargs to optionally accept a list
  command: 'ls [ipfsPath...]',

  describe: 'List objects pinned to local storage.',

  builder: {
    type: {
      type: 'string',
      alias: 't',
      default: 'all',
      choices: ['direct', 'indirect', 'recursive', 'all'],
      describe: 'The type of pinned keys to list.'
    },
    quiet: {
      type: 'boolean',
      alias: 'q',
      default: false,
      describe: 'Write just hashes of objects.'
    },
    'cid-base': {
      describe: 'Number base to display CIDs in.',
      type: 'string',
      choices: multibase.names
    }
  },

  handler: ({ ipfs, ipfsPath, type, quiet, cidBase }) => {
    const paths = ipfsPath

    ipfs.pin.ls(paths, { type, cidBase }, (err, results) => {
      if (err) { throw err }
      results.forEach((res) => {
        let line = res.hash
        if (!quiet) {
          line += ` ${res.type}`
        }
        print(line)
      })
    })
  }
}
