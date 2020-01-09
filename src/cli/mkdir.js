'use strict'

const {
  asBoolean,
  asOctal,
  asDateFromSeconds
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
    },
    mode: {
      type: 'number',
      coerce: asOctal,
      describe: 'Mode to apply to the new directory'
    },
    mtime: {
      type: 'date',
      coerce: asDateFromSeconds,
      describe: 'Mtime to apply to the new directory in seconds'
    }
  },

  handler (argv) {
    const {
      path,
      getIpfs,
      parents,
      cidVersion,
      hashAlg,
      flush,
      shardSplitThreshold,
      mode,
      mtime
    } = argv

    argv.resolve((async () => {
      const ipfs = await getIpfs()

      return ipfs.files.mkdir(path, {
        parents,
        cidVersion,
        hashAlg,
        flush,
        shardSplitThreshold,
        mode,
        mtime
      })
    })())
  }
}
