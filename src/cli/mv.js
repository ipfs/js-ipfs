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
    },
    'shard-split-threshold': {
      type: 'number',
      default: 1000,
      describe: 'If a directory has more links than this, it will be transformed into a hamt-sharded-directory'
    }
  },

  handler (argv) {
    const {
      source,
      dest,
      getIpfs,
      parents,
      recursive,
      shardSplitThreshold
    } = argv

    argv.resolve((async () => {
      const ipfs = await getIpfs()

      return ipfs.files.mv(source, dest, {
        parents,
        recursive,
        shardSplitThreshold
      })
    })())
  }
}
