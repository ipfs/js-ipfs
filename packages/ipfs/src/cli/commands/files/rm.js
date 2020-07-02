'use strict'

const {
  asBoolean
} = require('../../utils')
const parseDuration = require('parse-duration').default

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
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  handler ({
    ctx: { ipfs },
    path,
    recursive,
    timeout
  }) {
    return ipfs.files.rm(path, {
      recursive,
      timeout
    })
  }
}
