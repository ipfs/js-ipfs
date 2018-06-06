'use strict'

const {
  asBoolean
} = require('./utils')

module.exports = {
  command: 'mv <source> <dest>',

  describe: 'Move mfs files around',

  builder: {
    parents: {
      alias: 'p',
      type: 'boolean',
      default: false,
      coerce: asBoolean,
      describe: 'Create any non-existent intermediate directories'
    },
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
      source,
      dest,
      ipfs,
      parents,
      recursive
    } = argv

    argv.resolve(
      ipfs.files.mv(source, dest, {
        parents,
        recursive
      })
    )
  }
}
