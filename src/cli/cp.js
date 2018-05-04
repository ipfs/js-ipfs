'use strict'

module.exports = {
  command: 'cp <source> <dest>',

  describe: 'Copy files between locations in the mfs.',

  builder: {
    recursive: {
      alias: 'r',
      type: 'boolean',
      default: false,
      describe: 'Copy directories recursively'
    },
    parents: {
      alias: 'p',
      type: 'boolean',
      default: false,
      describe: 'Create any non-existent intermediate directories'
    }
  },

  handler (argv) {
    let {
      source,
      dest,
      ipfs,
      recursive,
      parents
    } = argv

    ipfs.mfs.cp(source, dest, {
      recursive,
      parents
    }, (error) => {
      if (error) {
        throw error
      }
    })
  }
}
