'use strict'

module.exports = {
  command: 'ls',

  describe: 'List objects pinned to local storage.',

  builder: {
    path: {
      type: 'string',
      describe: 'List pinned state of specific <ipfs-path>.'
    },
    type: {
      type: 'string',
      alias: 't',
      default: 'all',
      describe: ('The type of pinned keys to list. ' +
                 'Can be "direct", "indirect", "recursive", or "all".')
    },
    quiet: {
      type: 'boolean',
      alias: 'q',
      default: false,
      describe: 'Write just hashes of objects.'
    }
  },

  handler: (argv) => {
    const paths = argv.path && argv.path.split(' ')
    const type = argv.type
    const quiet = argv.quiet
    argv.ipfs.pin.ls(paths, { type }, (err, results) => {
      if (err) { throw err }
      results.forEach((res) => {
        let line = res.hash
        if (!quiet) {
          line += ` ${res.type}`
        }
        console.log(line)
      })
    })
  }
}
