'use strict'

const {
  asBoolean
} = require('./utils')

module.exports = {
  command: 'cp <source> <dest>',

  describe: 'Copy files between locations in the mfs',

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
      describe: 'Copy directories recursively'
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
