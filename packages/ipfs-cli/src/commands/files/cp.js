import {
  asBoolean
} from '../../utils.js'
import parseDuration from 'parse-duration'

export default {
  command: 'cp <source> <dest>',

  describe: 'Copy files between locations in the mfs',

  builder: {
    parents: {
      alias: 'p',
      type: 'boolean',
      default: false,
      coerce: asBoolean,
      describe: 'Create any non-existent intermediate directories'
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

  /**
   * @param {object} argv
   * @param {import('../../types').Context} argv.ctx
   * @param {string} argv.source
   * @param {string} argv.dest
   * @param {boolean} argv.parents
   * @param {string} argv.hashAlg
   * @param {boolean} argv.flush
   * @param {number} argv.shardSplitThreshold
   * @param {number} argv.timeout
   */
  handler ({
    ctx: { ipfs },
    source,
    dest,
    parents,
    flush,
    hashAlg,
    shardSplitThreshold,
    timeout
  }) {
    return ipfs.files.cp(source, dest, {
      parents,
      flush,
      hashAlg,
      shardSplitThreshold,
      timeout
    })
  }
}
