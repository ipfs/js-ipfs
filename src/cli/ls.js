'use strict'

const {
  print
} = require('./utils')

module.exports = {
  command: 'ls <path>',

  describe: 'List directories in the local mutable namespace.',

  builder: {
    long: {
      alias: 'l',
      type: 'boolean',
      default: false,
      describe: 'Use long listing format.'
    }
  },

  handler (argv) {
    let {
      path,
      ipfs,
      long
    } = argv

    ipfs.mfs.ls(path, {
      long
    }, (error, files) => {
      if (error) {
        throw error
      }

      files.forEach(link => {
        if (long) {
          return print(`${link.name} ${link.hash} ${link.size}`)
        }

        print(link.name)
      })
    })
  }
}
