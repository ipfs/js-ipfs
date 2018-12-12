'use strict'

const sortBy = require('lodash/sortBy')
const pull = require('pull-stream')
const getFolderSize = require('get-folder-size')
const byteman = require('byteman')
const reduce = require('async/reduce')
const mh = require('multihashes')
const multibase = require('multibase')
const { print, isDaemonOn, createProgressBar } = require('../utils')
const { cidToString } = require('../../utils/cid')
const globSource = require('../../utils/files/glob-source')

function getTotalBytes (paths, cb) {
  reduce(paths, 0, (total, path, cb) => {
    getFolderSize(path, (err, size) => {
      if (err) return cb(err)
      cb(null, total + size)
    })
  }, cb)
}

function addPipeline (paths, addStream, options) {
  const {
    recursive,
    quiet,
    quieter,
    silent
  } = options
  pull(
    globSource(...paths, { recursive }),
    addStream,
    pull.collect((err, added) => {
      if (err) {
        // Tweak the error message and add more relevant infor for the CLI
        if (err.code === 'ERR_DIR_NON_RECURSIVE') {
          err.message = `'${err.path}' is a directory, use the '-r' flag to specify directories`
        }
        throw err
      }

      if (silent) return
      if (quieter) return print(added.pop().hash)

      sortBy(added, 'path')
        .reverse()
        .map((file) => {
          const log = [ 'added', cidToString(file.hash, { base: options.cidBase }) ]
          if (!quiet && file.path.length > 0) log.push(file.path)
          return log.join(' ')
        })
        .forEach((msg) => print(msg))
    })
  )
}

module.exports = {
  command: 'add <file...>',

  describe: 'Add a file to IPFS using the UnixFS data format',

  builder: {
    progress: {
      alias: 'p',
      type: 'boolean',
      default: true,
      describe: 'Stream progress data'
    },
    recursive: {
      alias: 'r',
      type: 'boolean',
      default: false
    },
    trickle: {
      alias: 't',
      type: 'boolean',
      default: false,
      describe: 'Use the trickle DAG builder'
    },
    'wrap-with-directory': {
      alias: 'w',
      type: 'boolean',
      default: false
    },
    'only-hash': {
      alias: 'n',
      type: 'boolean',
      default: false,
      describe: 'Only chunk and hash, do not write'
    },
    chunker: {
      default: 'size-262144',
      describe: 'Chunking algorithm to use, formatted like [size-{size}, rabin, rabin-{avg}, rabin-{min}-{avg}-{max}]'
    },
    'enable-sharding-experiment': {
      type: 'boolean',
      default: false
    },
    'shard-split-threshold': {
      type: 'integer',
      default: 1000
    },
    'raw-leaves': {
      type: 'boolean',
      describe: 'Use raw blocks for leaf nodes. (experimental)'
    },
    'cid-version': {
      type: 'integer',
      describe: 'CID version. Defaults to 0 unless an option that depends on CIDv1 is passed. (experimental)',
      default: 0
    },
    'cid-base': {
      describe: 'Number base to display CIDs in.',
      type: 'string',
      choices: multibase.names
    },
    hash: {
      type: 'string',
      choices: Object.keys(mh.names),
      describe: 'Hash function to use. Will set CID version to 1 if used. (experimental)'
    },
    quiet: {
      alias: 'q',
      type: 'boolean',
      default: false,
      describe: 'Write minimal output'
    },
    quieter: {
      alias: 'Q',
      type: 'boolean',
      default: false,
      describe: 'Write only final hash'
    },
    silent: {
      type: 'boolean',
      default: false,
      describe: 'Write no output'
    },
    pin: {
      type: 'boolean',
      default: true,
      describe: 'Pin this object when adding'
    }
  },

  handler (argv) {
    const { ipfs } = argv
    const options = {
      strategy: argv.trickle ? 'trickle' : 'balanced',
      shardSplitThreshold: argv.enableShardingExperiment
        ? argv.shardSplitThreshold
        : Infinity,
      cidVersion: argv.cidVersion,
      rawLeaves: argv.rawLeaves,
      onlyHash: argv.onlyHash,
      hashAlg: argv.hash,
      wrapWithDirectory: argv.wrapWithDirectory,
      pin: argv.pin,
      chunker: argv.chunker
    }

    if (options.enableShardingExperiment && isDaemonOn()) {
      throw new Error('Error: Enabling the sharding experiment should be done on the daemon')
    }

    if (!argv.progress) {
      return addPipeline(argv.file, ipfs.addPullStream(options), argv)
    }

    getTotalBytes(argv.file, (err, totalBytes) => {
      if (err) throw err

      const bar = createProgressBar(totalBytes)

      options.progress = byteLength => {
        bar.update(byteLength / totalBytes, { progress: byteman(byteLength, 2, 'MB') })
      }

      addPipeline(argv.file, ipfs.addPullStream(options), argv)
    })
  }
}
