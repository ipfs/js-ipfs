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
 * @property {number} Argv.offset
 * @property {number} Argv.length
 * @property {boolean} Argv.create
 * @property {boolean} Argv.truncate
 * @property {boolean} Argv.rawLeaves
 * @property {boolean} Argv.reduceSingleLeafToSelf
 * @property {import('multiformats/cid').Version} Argv.cidVersion
 * @property {string} Argv.hashAlg
 * @property {boolean} Argv.parents
 * @property {'trickle' | 'balanced'} Argv.strategy
 * @property {boolean} Argv.flush
 * @property {number} Argv.shardSplitThreshold
 * @property {number} Argv.mode
 * @property {number} Argv.mtime
 * @property {number} Argv.mtimeNsecs
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'write <path>',

  describe: 'Write to mfs files',

  builder: {
    parents: {
      alias: 'p',
      boolean: true,
      default: false,
      describe: 'Create any non-existent intermediate directories'
    },
    create: {
      alias: 'e',
      boolean: true,
      default: false,
      coerce: asBoolean,
      describe: 'Create the file if it does not exist'
    },
    offset: {
      alias: 'o',
      number: true,
      describe: 'Start writing at this offset'
    },
    length: {
      alias: 'l',
      number: true,
      describe: 'Write only this number of bytes'
    },
    truncate: {
      alias: 't',
      boolean: true,
      default: false,
      coerce: asBoolean,
      describe: 'Truncate the file after writing'
    },
    'raw-leaves': {
      alias: 'r',
      boolean: true,
      default: false,
      coerce: asBoolean,
      describe: 'Whether to write leaf nodes as raw UnixFS nodes'
    },
    'reduce-single-leaf-to-self': {
      boolean: true,
      default: false,
      coerce: asBoolean,
      describe: 'If a file can fit in one DAGNode, only use one DAGNode instead of storing the data in a child'
    },
    flush: {
      alias: 'f',
      boolean: true,
      default: true,
      coerce: asBoolean,
      describe: 'Flush the changes to disk immediately'
    },
    strategy: {
      alias: 's',
      string: true,
      default: 'balanced'
    },
    'cid-version': {
      alias: ['cid-ver'],
      number: true,
      default: 0,
      describe: 'Cid version to use'
    },
    'hash-alg': {
      alias: 'h',
      string: true,
      default: 'sha2-256'
    },
    'shard-split-threshold': {
      number: true,
      default: 1000,
      describe: 'If a directory has more links than this, it will be transformed into a hamt-sharded-directory'
    },
    mode: {
      number: true,
      coerce: asOctal,
      describe: 'The mode to use'
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
    ctx: { ipfs, getStdin },
    path,
    offset,
    length,
    create,
    truncate,
    rawLeaves,
    reduceSingleLeafToSelf,
    cidVersion,
    hashAlg,
    parents,
    strategy,
    flush,
    shardSplitThreshold,
    mode,
    mtime,
    mtimeNsecs,
    timeout
  }) {
    await ipfs.files.write(path, getStdin(), {
      offset,
      length,
      create,
      truncate,
      rawLeaves,
      reduceSingleLeafToSelf,
      cidVersion,
      hashAlg,
      parents,
      strategy,
      flush,
      shardSplitThreshold,
      mode,
      mtime: asMtimeFromSeconds(mtime, mtimeNsecs),
      timeout
    })
  }
}

export default command
