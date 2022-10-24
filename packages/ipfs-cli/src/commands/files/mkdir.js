import {
  asBoolean,
  asOctal,
  asMtimeFromSeconds,
  coerceMtime,
  coerceMtimeNsecs
} from '../../utils.js'
import parseDuration from 'parse-duration'

/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {string} Argv.path
 * @property {boolean} Argv.parents
 * @property {import('multiformats/cid').Version} Argv.cidVersion
 * @property {string} Argv.hashAlg
 * @property {boolean} Argv.flush
 * @property {number} Argv.shardSplitThreshold
 * @property {number} Argv.mode
 * @property {number} Argv.mtime
 * @property {number} Argv.mtimeNsecs
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'mkdir <path>',

  describe: 'Make mfs directories',

  builder: {
    parents: {
      alias: 'p',
      boolean: true,
      default: false,
      coerce: asBoolean,
      describe: 'No error if existing, make parent directories as needed.'
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
    flush: {
      alias: 'f',
      boolean: true,
      default: true,
      coerce: asBoolean,
      describe: 'Flush the changes to disk immediately'
    },
    'shard-split-threshold': {
      number: true,
      default: 1000,
      describe: 'If a directory has more links than this, it will be transformed into a hamt-sharded-directory'
    },
    mode: {
      number: true,
      coerce: asOctal,
      describe: 'Mode to apply to the new directory'
    },
    mtime: {
      number: true,
      coerce: coerceMtime,
      describe: 'Modification time in seconds before or since the Unix Epoch to apply to created UnixFS entries'
    },
    'mtime-nsecs': {
      number: true,
      coerce: coerceMtimeNsecs,
      describe: 'Modification time fraction in nanoseconds'
    },
    timeout: {
      string: true,
      coerce: parseDuration
    }
  },

  async handler ({
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
    await ipfs.files.mkdir(path, {
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

export default command
