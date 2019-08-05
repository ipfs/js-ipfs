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
    'hash-alg': {
      alias: 'h',
      type: 'string',
      default: 'sha2-256',
      describe: 'Hash function to use. Will set CID version to 1 if used'
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
      format,
      hashAlg,
      shardSplitThreshold
    } = argv

    argv.resolve((async () => {
      const ipfs = await getIpfs()
      return ipfs.files.cp(source, dest, {
        parents,
        format,
        hashAlg,
        shardSplitThreshold
      })
    })())
  }
}
