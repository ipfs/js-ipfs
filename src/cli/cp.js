'use strict'

module.exports = {
  command: 'cp <source> <dest>',

  describe: 'Copy files between locations in the mfs.',

  builder: {
    parents: {
      alias: 'p',
      type: 'boolean',
      default: false,
      describe: 'Create any non-existent intermediate directories'
    },
    recursive: {
      alias: 'r',
      type: 'boolean',
      default: false,
      describe: 'Remove directories recursively'
    }
  },

  handler (argv) {
    let {
      source,
      dest,
      ipfs,
      parents,
      recursive
    } = argv

    ipfs.mfs.cp(source, dest, {
      parents,
      recursive
    }, (error) => {
      if (error) {
        throw error
      }
    })
  }
}
