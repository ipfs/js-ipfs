'use strict'

const {
  asBoolean
} = require('../../utils')
const parseDuration = require('parse-duration').default

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
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  handler ({
    ctx: { ipfs },
    source,
    dest,
    parents,
    recursive,
    cidVersion,
    hashAlg,
    flush,
    shardSplitThreshold,
    timeout
  }) {
    return ipfs.files.mv(source, dest, {
      parents,
      recursive,
      cidVersion,
      hashAlg,
      flush,
      shardSplitThreshold,
      timeout
    })
  }
}
