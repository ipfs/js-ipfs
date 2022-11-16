import {
  asBoolean
} from '../../utils.js'
import parseDuration from 'parse-duration'

/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {string} Argv.source
 * @property {string} Argv.dest
 * @property {boolean} Argv.parents
 * @property {import('multiformats/cid').Version} Argv.cidVersion
 * @property {string} Argv.hashAlg
 * @property {boolean} Argv.flush
 * @property {number} Argv.shardSplitThreshold
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'mv <source> <dest>',

  describe: 'Move mfs files around',

  builder: {
    parents: {
      alias: 'p',
      boolean: true,
      default: false,
      coerce: asBoolean,
      describe: 'Create any non-existent intermediate directories'
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
    timeout: {
      string: true,
      coerce: parseDuration
    }
  },

  async handler ({
    ctx: { ipfs },
    source,
    dest,
    parents,
    cidVersion,
    hashAlg,
    flush,
    shardSplitThreshold,
    timeout
  }) {
    await ipfs.files.mv(source, dest, {
      parents,
      cidVersion,
      hashAlg,
      flush,
      shardSplitThreshold,
      timeout
    })
  }
}

export default command
