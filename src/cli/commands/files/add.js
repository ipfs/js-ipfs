'use strict'

const fs = require('fs')
const path = require('path')
const glob = require('glob')
const sortBy = require('lodash/sortBy')
const pull = require('pull-stream')
const paramap = require('pull-paramap')
const zip = require('pull-zip')
const getFolderSize = require('get-folder-size')
const byteman = require('byteman')
const waterfall = require('async/waterfall')
const mh = require('multihashes')
const utils = require('../../utils')
const print = require('../../utils').print
const createProgressBar = require('../../utils').createProgressBar

function checkPath (inPath, recursive) {
  // This function is to check for the following possible inputs
  // 1) "." add the cwd but throw error for no recursion flag
  // 2) "." -r return the cwd
  // 3) "/some/path" but throw error for no recursion
  // 4) "/some/path" -r
  // 5) No path, throw err
  // 6) filename.type return the cwd + filename

  if (!inPath) {
    throw new Error('Error: Argument \'path\' is required')
  }

  if (inPath === '.') {
    inPath = process.cwd()
  }

  // Convert to POSIX format
  inPath = inPath
    .split(path.sep)
    .join('/')

  // Strips trailing slash from path.
  inPath = inPath.replace(/\/$/, '')

  if (fs.statSync(inPath).isDirectory() && recursive === false) {
    throw new Error(`Error: ${inPath} is a directory, use the '-r' flag to specify directories`)
  }

  return inPath
}

function getTotalBytes (path, recursive, cb) {
  if (recursive) {
    getFolderSize(path, cb)
  } else {
    fs.stat(path, (err, stat) => cb(err, stat.size))
  }
}

function addPipeline (index, addStream, list, argv) {
  const {
    quiet,
    quieter,
    silent
  } = argv
  pull(
    zip(
      pull.values(list),
      pull(
        pull.values(list),
        paramap(fs.stat.bind(fs), 50)
      )
    ),
    pull.map((pair) => ({
      path: pair[0],
      isDirectory: pair[1].isDirectory()
    })),
    pull.filter((file) => !file.isDirectory),
    pull.map((file) => ({
      path: file.path.substring(index, file.path.length),
      content: fs.createReadStream(file.path)
    })),
    addStream,
    pull.collect((err, added) => {
      if (err) {
        throw err
      }

      if (silent) return
      if (quieter) return print(added.pop().hash)

      sortBy(added, 'path')
        .reverse()
        .map((file) => {
          const log = [ 'added', file.hash ]

          if (!quiet && file.path.length > 0) log.push(file.path)

          return log.join(' ')
        })
        .forEach((msg) => print(msg))
    })
  )
}

module.exports = {
  command: 'add <file>',

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
      default: false,
      describe: 'Use raw blocks for leaf nodes. (experimental)'
    },
    'cid-version': {
      type: 'integer',
      describe: 'CID version. Defaults to 0 unless an option that depends on CIDv1 is passed. (experimental)',
      default: 0
    },
    hash: {
      type: 'string',
      choices: Object.keys(mh.names),
      describe: 'Hash function to use. Will set Cid version to 1 if used. (experimental)'
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
    const inPath = checkPath(argv.file, argv.recursive)
    const index = inPath.lastIndexOf('/') + 1
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
      pin: argv.pin
    }

    if (options.enableShardingExperiment && utils.isDaemonOn()) {
      throw new Error('Error: Enabling the sharding experiment should be done on the daemon')
    }
    const ipfs = argv.ipfs

    let list
    waterfall([
      (next) => {
        if (fs.statSync(inPath).isDirectory()) {
          return glob('**/*', { cwd: inPath }, next)
        }
        next(null, [])
      },
      (globResult, next) => {
        if (globResult.length === 0) {
          list = [inPath]
        } else {
          list = globResult.map((f) => inPath + '/' + f)
        }
        getTotalBytes(inPath, argv.recursive, next)
      },
      (totalBytes, next) => {
        if (argv.progress) {
          const bar = createProgressBar(totalBytes)
          options.progress = function (byteLength) {
            bar.update(byteLength / totalBytes, {progress: byteman(byteLength, 2, 'MB')})
          }
        }

        next(null, ipfs.files.addPullStream(options))
      }
    ], (err, addStream) => {
      if (err) throw err

      addPipeline(index, addStream, list, argv)
    })
  }
}
