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
    }
  },

  handler (argv) {
    let {
      source,
      dest,
      ipfs,
      parents
    } = argv

    ipfs.mfs.cp(source, dest, {
      parents
    }, (error) => {
      if (error) {
        throw error
      }
    })
  }
}
