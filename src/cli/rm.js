'use strict'

const {
  asBoolean
} = require('./utils')

module.exports = {
  command: 'rm <path>',

  describe: 'Remove an mfs file or directory',

  builder: {
    recursive: {
      alias: 'r',
      type: 'boolean',
      default: false,
      coerce: asBoolean,
      describe: 'Remove directories recursively'
    }
  },

  handler (argv) {
    let {
      path,
      ipfs,
      recursive
    } = argv

    argv.resolve(
      ipfs.files.rm(path, {
        recursive
      })
    )
  }
}
