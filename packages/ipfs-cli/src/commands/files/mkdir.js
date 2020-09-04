'use strict'

const {
  asBoolean,
  asOctal,
  asMtimeFromSeconds,
  coerceMtime,
  coerceMtimeNsecs
} = require('../../utils')
const parseDuration = require('parse-duration').default

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
      type: 'number',
      coerce: coerceMtime,
      describe: 'Modification time in seconds before or since the Unix Epoch to apply to created UnixFS entries'
    },
    'mtime-nsecs': {
      type: 'number',
      coerce: coerceMtimeNsecs,
      describe: 'Modification time fraction in nanoseconds'
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  handler ({
    ctx: { ipfs },
    path,
    parents,
    cidVersion,
    hashAlg,
    flush,
    shardSplitThreshold,
    mode,
    mtime,
    mtimeNsecs,
    timeout
  }) {
    return ipfs.files.mkdir(path, {
      parents,
      cidVersion,
      hashAlg,
      flush,
      shardSplitThreshold,
      mode,
      mtime: asMtimeFromSeconds(mtime, mtimeNsecs),
      timeout
    })
  }
}
