'use strict'

const utils = require('../../utils')
const debug = require('debug')
const log = debug('cli:version')
log.error = debug('cli:version:error')
const fs = require('fs')
const path = require('path')
const glob = require('glob')
const sortBy = require('lodash.sortby')
const pull = require('pull-stream')
const pullFile = require('pull-file')
const paramap = require('pull-paramap')
const zip = require('pull-zip')

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
    }
  },

  handler (argv) {
    const inPath = checkPath(argv.file, argv.recursive)
    const index = inPath.lastIndexOf('/') + 1

    utils.getIPFS((err, ipfs) => {
      if (err) throw err

      glob(path.join(inPath, '/**/*'), (err, list) => {
        if (err) throw err
        if (list.length === 0) list = [inPath]

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
            content: pullFile(file.path)
          })),
          ipfs.files.createAddPullStream(),
          pull.map((file) => ({
            hash: file.hash,
            path: file.path
          })),
          pull.collect((err, added) => {
            if (err) throw err

            sortBy(added, 'path')
              .reverse()
              .map((file) => `added ${file.hash} ${file.path}`)
              .forEach((msg) => console.log(msg))
          })
        )
      })
    })
  }
}
