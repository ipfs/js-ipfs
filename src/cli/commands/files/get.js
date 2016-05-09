'use strict'

const Command = require('ronin').Command
const debug = require('debug')
const utils = require('../../utils')
const log = debug('cli:files')
log.error = debug('cli:files:error')
var fs = require('fs')
const path = require('path')
const pathExists = require('path-exists')

function checkArgs (hash, outPath) {
  if (!hash) {
    throw new Error("Argument 'path' is required")
  }
  // format the output directory
  if (!outPath) {
    var cwd = process.cwd()
    return cwd
  } else {
    if (!outPath.endsWith('/')) {
      outPath += '/'
    }
    if (!outPath.startsWith('/')) {
      outPath = path.join('/', outPath)
    }
    var directory = outPath
    return directory
  }
}

function ensureDir (dir, cb) {
  pathExists(dir)
    .then((exists) => {
      if (!exists) {
        fs.mkdir(dir, cb)
      } else {
        cb()
      }
    })
    .catch(cb)
}

function fileHandler (result, dir) {
  return function onFile (file) {
    // Check to see if the result is in a directory
    if (file.path.lastIndexOf('/') === -1) {
      const dirPath = path.join(dir, file.path)
      // Check to see if the result is a directory
      if (file.dir === false) {
        file.stream.pipe(fs.createWriteStream(dirPath))
      } else {
        ensureDir(dirPath, (err) => {
          if (err) {
            throw err
          }
        })
      }
    } else {
      const filePath = file.path.substring(0, file.path.lastIndexOf('/') + 1)
      const dirPath = path.join(dir, filePath)
      ensureDir(dirPath, (err) => {
        if (err) {
          throw err
        }

        file.stream.pipe(fs.createWriteStream(dirPath))
      })
    }
  }
}

module.exports = Command.extend({
  desc: 'Download IPFS objects',

  run: (hash, outPath) => {
    const dir = checkArgs(hash, outPath)

    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }
      ipfs.files.get(hash, (err, result) => {
        if (err) {
          throw err
        }
        result.on('file', fileHandler(result, dir))
      })
    })
  }
})
