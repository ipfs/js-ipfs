'use strict'

const {
  asBoolean,
  asOctal
} = require('./utils')

module.exports = {
  command: 'chmod [mode] [path]',

  describe: 'Change file modes',

  builder: {
    path: {
      type: 'string',
      describe: 'The MFS path to change the mode of'
    },
    mode: {
      type: 'int',
      coerce: asOctal,
      describe: 'The mode to use'
    },
    recursive: {
      alias: 'r',
      type: 'boolean',
      default: false,
      coerce: asBoolean,
      describe: 'Whether to change modes recursively'
    },
    codec: {
      alias: 'c',
      type: 'string',
      default: 'dag-pb',
      describe: 'If intermediate directories are created, use this codec to create them (experimental)'
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
      path,
      mode,
      getIpfs,
      recursive,
      codec,
      hashAlg,
      flush,
      shardSplitThreshold
    } = argv

    argv.resolve((async () => {
      const ipfs = await getIpfs()

      return ipfs.files.chmod(path, mode, {
        recursive,
        format: codec,
        hashAlg,
        flush,
        shardSplitThreshold
      })
    })())
  }
}
