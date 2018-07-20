'use strict'

const {
  asBoolean
} = require('./utils')

module.exports = {
  command: 'write <path>',

  describe: 'Write to mfs files',

  builder: {
    parents: {
      alias: 'p',
      type: 'boolean',
      describe: 'Create any non-existent intermediate directories'
    },
    create: {
      alias: 'e',
      type: 'boolean',
      default: false,
      coerce: asBoolean,
      describe: 'Create the file if it does not exist'
    },
    offset: {
      alias: 'o',
      type: 'number',
      describe: 'Start writing at this offset'
    },
    length: {
      alias: 'l',
      type: 'number',
      describe: 'Write only this number of bytes'
    },
    truncate: {
      alias: 't',
      type: 'boolean',
      default: false,
      coerce: asBoolean,
      describe: 'Truncate the file after writing'
    },
    rawLeaves: {
      alias: 'r',
      type: 'boolean',
      default: false,
      coerce: asBoolean,
      describe: 'Whether to write leaf nodes as raw UnixFS nodes'
    },
    reduceSingleLeafToSelf: {
      type: 'boolean',
      default: false,
      coerce: asBoolean,
      describe: 'If a file can fit in one DAGNode, only use one DAGNode instead of storing the data in a child'
    },
    flush: {
      alias: 'f',
      type: 'boolean',
      default: true,
      coerce: asBoolean,
      describe: 'Flush the changes to disk immediately'
    },
    strategy: {
      alias: 's',
      type: 'string',
      default: 'balanced'
    },
    cidVersion: {
      alias: ['cid-ver', 'cid-version'],
      type: 'number',
      default: 0,
      describe: 'Cid version to use. (experimental).'
    },
    hashAlg: {
      alias: 'h',
      type: 'string',
      default: 'sha2-256'
    },
    format: {
      type: 'string',
      default: 'dag-pb'
    }
  },

  handler (argv) {
    let {
      path,
      ipfs,
      offset,
      length,
      create,
      truncate,
      rawLeaves,
      reduceSingleLeafToSelf,
      cidVersion,
      hashAlg,
      format,
      parents,
      progress,
      strategy,
      flush
    } = argv

    argv.resolve(
      ipfs.files.write(path, process.stdin, {
        offset,
        length,
        create,
        truncate,
        rawLeaves,
        reduceSingleLeafToSelf,
        cidVersion,
        hashAlg,
        format,
        parents,
        progress,
        strategy,
        flush
      })
    )
  }
}
