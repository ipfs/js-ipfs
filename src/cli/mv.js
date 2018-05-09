'use strict'

module.exports = {
  command: 'mv <source> <dest>',

  describe: 'Move files around. Just like traditional unix mv',

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

    ipfs.mfs.mv(source, dest, {
      parents,
      recursive
    }, (error) => {
      if (error) {
        throw error
      }
    })
  }
}
