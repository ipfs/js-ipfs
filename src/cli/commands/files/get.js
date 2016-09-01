'use strict'

const debug = require('debug')
const utils = require('../../utils')
const log = debug('cli:files')
log.error = debug('cli:files:error')
var fs = require('fs')
const path = require('path')
const pathExists = require('path-exists')

function checkArgs (hash, outPath) {
  // format the output directory
  if (!outPath.endsWith('/')) {
    outPath += '/'
  }

  if (!outPath.startsWith('/')) {
    outPath = path.join('/', outPath)
  }

  return outPath
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
        file.content.pipe(fs.createWriteStream(dirPath))
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

        file.content.pipe(fs.createWriteStream(dirPath))
      })
    }
  }
}

module.exports = {
  command: 'get <ipfs-path>',

  describe: 'Download IPFS objects',

  builder: {
    output: {
      alias: 'o',
      type: 'string',
      default: process.cwd()
    }
  },

  handler (argv) {
    const dir = checkArgs(argv.ipfsPath, argv.output)

    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }
      ipfs.files.get(argv.ipfsPath, (err, result) => {
        if (err) {
          throw err
        }
        result.on('data', fileHandler(result, dir))
      })
    })
  }
}
