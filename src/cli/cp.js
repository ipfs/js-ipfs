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
    format: {
      alias: 'h',
      type: 'string',
      default: 'dag-pb',
      describe: 'If intermediate directories are created, use this format to create them (experimental)'
    },
    hash: {
      alias: 'h',
      type: 'string',
      default: 'sha2-256',
      describe: 'Hash function to use. Will set Cid version to 1 if used. (experimental)'
    }
  },

  handler (argv) {
    let {
      source,
      dest,
      ipfs,
      parents,
      format,
      hash
    } = argv

    argv.resolve(
      ipfs.files.cp(source, dest, {
        parents,
        format,
        hashAlg: hash
      })
    )
  }
}
