'use strict'

module.exports = {
  command: 'rm <path>',

  describe: 'Remove a file or directory',

  builder: {
    recursive: {
      alias: 'r',
      type: 'boolean',
      default: false,
      describe: 'Remove directories recursively'
    }
  },

  handler (argv) {
    let {
      path,
      ipfs,
      recursive
    } = argv

    ipfs.mfs.rm(path, {
      recursive
    }, (error) => {
      if (error) {
        throw error
      }
    })
  }
}
