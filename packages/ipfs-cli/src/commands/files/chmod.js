import {
  asBoolean
} from '../../utils.js'
import parseDuration from 'parse-duration'

/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {string} Argv.path
 * @property {number} Argv.mode
 * @property {boolean} Argv.recursive
 * @property {string} Argv.hashAlg
 * @property {boolean} Argv.flush
 * @property {number} Argv.shardSplitThreshold
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'chmod [mode] [path]',

  describe: 'Change file modes',

  builder: {
    path: {
      string: true,
      describe: 'The MFS path to change the mode of'
    },
    mode: {
      string: true,
      describe: 'The mode to use'
    },
    recursive: {
      alias: 'r',
      boolean: true,
      default: false,
      coerce: asBoolean,
      describe: 'Whether to change modes recursively'
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
    path,
    mode,
    recursive,
    hashAlg,
    flush,
    shardSplitThreshold,
    timeout
  }) {
    await ipfs.files.chmod(path, mode, {
      recursive,
      hashAlg,
      flush,
      shardSplitThreshold,
      timeout
    })
  }
}

export default command
