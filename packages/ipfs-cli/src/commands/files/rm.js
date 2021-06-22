'use strict'

const {
  asBoolean
} = require('../../utils')
const { default: parseDuration } = require('parse-duration')

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

  /**
   * @param {object} argv
   * @param {import('../../types').Context} argv.ctx
   * @param {string} argv.path
   * @param {boolean} argv.recursive
   * @param {number} argv.timeout
   */
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
