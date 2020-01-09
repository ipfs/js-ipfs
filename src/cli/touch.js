'use strict'

const {
  asBoolean,
  asDateFromSeconds
} = require('./utils')

module.exports = {
  command: 'touch [path]',

  describe: 'change file modification times',

  builder: {
    mtime: {
      alias: 'm',
      type: 'date',
      coerce: asDateFromSeconds,
      default: Date.now(),
      describe: 'Time to use as the new modification time'
    },
    flush: {
      alias: 'f',
      type: 'boolean',
      default: true,
      coerce: asBoolean,
      describe: 'Flush the changes to disk immediately'
    },
    'cid-version': {
      alias: ['cid-ver'],
      type: 'number',
      default: 0,
      describe: 'Cid version to use. (experimental).'
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
      path,
      getIpfs,
      flush,
      cidVersion,
      hashAlg,
      shardSplitThreshold,
      mtime
    } = argv

    argv.resolve((async () => {
      const ipfs = await getIpfs()

      return ipfs.files.touch(path, {
        mtime,
        flush,
        cidVersion,
        hashAlg,
        shardSplitThreshold
      })
    })())
  }
}
