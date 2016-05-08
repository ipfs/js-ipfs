'use strict'

const Command = require('ronin').Command
const debug = require('debug')
const utils = require('../../utils')
const log = debug('cli:files')
log.error = debug('cli:files:error')
var fs = require('fs')
const path = require('path')
const pathExists = require('path-exists')
const async = require('async')

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

function getFiles (result, dir) {
  var filePath
  result.on('file', (file) => {
    // Check to see if the result is in a directory
    if (file.path.lastIndexOf('/') === -1) {
      filePath = file.path
      // Check to see if the result is a directory
      if (file.dir === false) {
        const ws = fs.createWriteStream(path.join(dir, file.path))
        file.stream.pipe(ws)
      } else {
        // Check to see if the directory has already been created
        pathExists(path.join(dir, file.path)).then(exists => {
          if (!exists) {
            fs.mkdir(path.join(dir, file.path), (err) => {
              if (err) {
                throw err
              }
            })
          }
        })
      }
    } else {
      // Check to see if the directory has already been created
      filePath = file.path.substring(0, file.path.lastIndexOf('/') + 1)
      pathExists(path.join(dir, filePath)).then(exists => {
        // Create a directory for the incoming files
        if (!exists) {
          async.waterfall([
            (cb) => {
              fs.mkdir(path.join(dir, filePath), (err) => {
                if (err) {
                  cb(err)
                }
                cb(null)
              })
            },
            (cb) => {
              const ws = fs.createWriteStream(path.join(dir, file.path))
              file.stream.pipe(ws)
              cb(null)
            }
          ], (err) => {
            if (err) {
              throw err
            }
          })
        }
        // Just write the file
        const ws = fs.createWriteStream(path.join(dir, file.path))
        file.stream.pipe(ws)
      })
    }
  })
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
        getFiles(result, dir)
      })
    })
  }
})
