'use strict'

const fs = require('fs')
const path = require('path')
const glob = require('glob')
const sortBy = require('lodash.sortby')
const pull = require('pull-stream')
const paramap = require('pull-paramap')
const zip = require('pull-zip')
const toPull = require('stream-to-pull-stream')
const utils = require('../../utils')

const WRAPPER = 'wrapper/'

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

  if (fs.statSync(inPath).isDirectory() && recursive === false) {
    throw new Error(`Error: ${inPath} is a directory, use the '-r' flag to specify directories`)
  }

  return inPath
}

module.exports = {
  command: 'add <file>',

  describe: 'Add a file to IPFS using the UnixFS data format',

  builder: {
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
    'enable-sharding-experiment': {
      type: 'boolean',
      default: false
    },
    'shard-split-threshold': {
      type: 'integer',
      default: 1000
    }
  },

  handler (argv) {
    const inPath = checkPath(argv.file, argv.recursive)
    const index = inPath.lastIndexOf('/') + 1
    const options = {
      strategy: argv.trickle ? 'trickle' : 'balanced',
      shardSplitThreshold: argv.enableShardingExperiment ? argv.shardSplitThreshold : Infinity
    }

    if (argv.enableShardingExperiment && utils.isDaemonOn()) {
      throw new Error('Error: Enabling the sharding experiment should be done on the daemon')
    }
    const ipfs = argv.ipfs

    // TODO: revist when interface-ipfs-core exposes pull-streams
    let createAddStream = (cb) => {
      ipfs.files.createAddStream(options, (err, stream) => {
        cb(err, err ? null : toPull.transform(stream))
      })
    }

    if (typeof ipfs.files.createAddPullStream === 'function') {
      createAddStream = (cb) => {
        cb(null, ipfs.files.createAddPullStream(options))
      }
    }

    createAddStream((err, addStream) => {
      if (err) {
        throw err
      }

      glob(path.join(inPath, '/**/*'), (err, list) => {
        if (err) {
          throw err
        }
        if (list.length === 0) {
          list = [inPath]
        }

        addPipeline(index, addStream, list, argv.wrapWithDirectory)
      })
    })
  }
}

function addPipeline (index, addStream, list, wrapWithDirectory) {
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
      originalPath: file.path
    })),
    pull.map((file) => ({
      path: wrapWithDirectory ? path.join(WRAPPER, file.path) : file.path,
      content: fs.createReadStream(file.originalPath)
    })),
    addStream,
    pull.map((file) => ({
      hash: file.hash,
      path: wrapWithDirectory ? file.path.substring(WRAPPER.length) : file.path
    })),
    pull.collect((err, added) => {
      if (err) {
        throw err
      }

      sortBy(added, 'path')
        .reverse()
        .map((file) => {
          const log = [ 'added', file.hash ]

          if (file.path.length > 0) log.push(file.path)

          return log.join(' ')
        })
        .forEach((msg) => console.log(msg))
    })
  )
}
