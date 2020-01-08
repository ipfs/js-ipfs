'use strict'

module.exports = {
  command: 'rm <hash...>',

  describe: 'Remove IPFS block(s)',

  builder: {
    force: {
      alias: 'f',
      describe: 'Ignore nonexistent blocks',
      type: 'boolean',
      default: false
    },
    quiet: {
      alias: 'q',
      describe: 'Write minimal output',
      type: 'boolean',
      default: false
    }
  },

  async handler ({ ipfs, print, hash, force, quiet }) {
    let errored = false

    for await (const result of ipfs.api.block.rm(hash, {
      force,
      quiet
    })) {
      if (result.error) {
        errored = true
      }

      if (!quiet) {
        print(result.error ? result.error.message : `removed ${result.cid}`)
      }
    }

    if (errored && !quiet) {
      throw new Error('some blocks not removed')
    }
  }
}
