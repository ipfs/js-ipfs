import {
  asBoolean,
  asMtimeFromSeconds,
  coerceMtime,
  coerceMtimeNsecs
} from '../../utils.js'
import parseDuration from 'parse-duration'

/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {string} Argv.path
 * @property {boolean} Argv.flush
 * @property {import('multiformats/cid').Version} Argv.cidVersion
 * @property {string} Argv.hashAlg
 * @property {number} Argv.shardSplitThreshold
 * @property {number} Argv.mtime
 * @property {number} Argv.mtimeNsecs
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'touch [path]',

  describe: 'change file modification times',

  builder: {
    mtime: {
      number: true,
      alias: 'm',
      coerce: coerceMtime,
      describe: 'Modification time in seconds before or since the Unix Epoch to apply to created UnixFS entries'
    },
    'mtime-nsecs': {
      number: true,
      coerce: coerceMtimeNsecs,
      describe: 'Modification time fraction in nanoseconds'
    },
    flush: {
      alias: 'f',
      boolean: true,
      default: true,
      coerce: asBoolean,
      describe: 'Flush the changes to disk immediately'
    },
    'cid-version': {
      alias: ['cid-ver'],
      number: true,
      default: 0,
      describe: 'Cid version to use. (experimental).'
    },
    'hash-alg': {
      alias: 'h',
      string: true,
      default: 'sha2-256',
      describe: 'Hash function to use. Will set CID version to 1 if used'
    },
    'shard-split-threshold': {
      number: true,
      default: 1000,
      describe: 'If a directory has more links than this, it will be transformed into a hamt-sharded-directory'
    },
    timeout: {
      string: true,
      coerce: parseDuration
    }
  },

  async handler ({
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
    await ipfs.files.touch(path, {
      mtime: asMtimeFromSeconds(mtime, mtimeNsecs),
      flush,
      cidVersion,
      hashAlg,
      shardSplitThreshold,
      timeout
    })
  }
}

export default command
