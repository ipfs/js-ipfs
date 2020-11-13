'use strict'

const parseDuration = require('parse-duration').default

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
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  async handler ({ ctx, hash, force, quiet, timeout }) {
    const { ipfs, print } = ctx

    let errored = false

    for await (const result of ipfs.block.rm(hash, {
      force,
      quiet,
      timeout
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
