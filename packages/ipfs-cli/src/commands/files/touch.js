'use strict'

const {
  asBoolean,
  asMtimeFromSeconds,
  coerceMtime,
  coerceMtimeNsecs
} = require('../../utils')
const { default: parseDuration } = require('parse-duration')

module.exports = {
  command: 'touch [path]',

  describe: 'change file modification times',

  builder: {
    mtime: {
      type: 'number',
      alias: 'm',
      coerce: coerceMtime,
      describe: 'Modification time in seconds before or since the Unix Epoch to apply to created UnixFS entries'
    },
    'mtime-nsecs': {
      type: 'number',
      coerce: coerceMtimeNsecs,
      describe: 'Modification time fraction in nanoseconds'
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
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  /**
   * @param {object} argv
   * @param {import('../../types').Context} argv.ctx
   * @param {string} argv.path
   * @param {boolean} argv.flush
   * @param {import('cids').CIDVersion} argv.cidVersion
   * @param {import('multihashes').HashName} argv.hashAlg
   * @param {number} argv.shardSplitThreshold
   * @param {number} argv.mtime
   * @param {number} argv.mtimeNsecs
   * @param {number} argv.timeout
   */
  handler ({
    ctx: { ipfs },
    path,
    flush,
    cidVersion,
    hashAlg,
    shardSplitThreshold,
    mtime,
    mtimeNsecs,
    timeout
  }) {
    return ipfs.files.touch(path, {
      mtime: asMtimeFromSeconds(mtime, mtimeNsecs),
      flush,
      cidVersion,
      hashAlg,
      shardSplitThreshold,
      timeout
    })
  }
}
