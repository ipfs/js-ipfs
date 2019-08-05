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
    const {
      path,
      getIpfs,
      recursive
    } = argv

    argv.resolve((async () => {
      const ipfs = await getIpfs()

      return ipfs.files.rm(path, {
        recursive
      })
    })())
  }
}
