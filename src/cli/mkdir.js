'use strict'

const {
  asBoolean
} = require('./utils')

module.exports = {
  command: 'mkdir <path>',

  describe: 'Make mfs directories',

  builder: {
    parents: {
      alias: 'p',
      type: 'boolean',
      default: false,
      coerce: asBoolean,
      describe: 'No error if existing, make parent directories as needed.'
    },
    cidVersion: {
      alias: ['cid-ver', 'cid-version'],
      type: 'integer',
      describe: 'Cid version to use. (experimental).'
    },
    hash: {
      type: 'string',
      describe: 'Hash function to use. Will set Cid version to 1 if used. (experimental).'
    },
    flush: {
      alias: 'f',
      type: 'boolean',
      coerce: asBoolean,
      describe: 'Weird undocumented option'
    }
  },

  handler (argv) {
    let {
      path,
      ipfs,
      parents,
      cidVersion,
      hash,
      flush
    } = argv

    argv.resolve(
      ipfs.files.mkdir(path, {
        parents,
        cidVersion,
        hash,
        flush
      })
    )
  }
}
