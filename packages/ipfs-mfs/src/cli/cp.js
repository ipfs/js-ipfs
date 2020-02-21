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
    'hash-alg': {
      alias: 'h',
      type: 'string',
      default: 'sha2-256',
      describe: 'Hash function to use. Will set CID version to 1 if used'
    },
    flush: {
      alias: 'f',
      type: 'boolean',
      default: true,
      coerce: asBoolean,
      describe: 'Flush the changes to disk immediately'
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
      flush,
      hashAlg,
      shardSplitThreshold
    } = argv

    argv.resolve((async () => {
      const ipfs = await getIpfs()
      return ipfs.files.cp(source, dest, {
        parents,
        flush,
        hashAlg,
        shardSplitThreshold
      })
    })())
  }
}
