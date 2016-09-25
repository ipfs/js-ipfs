'use strict'

const debug = require('debug')
const utils = require('../../utils')
const log = debug('cli:files')
log.error = debug('cli:files:error')
var fs = require('fs')
const path = require('path')
const pathExists = require('path-exists')
const pull = require('pull-stream')
const toPull = require('stream-to-pull-stream')

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

function fileHandler (dir) {
  return function onFile (file, cb) {
    const lastSlash = file.path.lastIndexOf('/')
    // Check to see if the result is in a directory
    if (lastSlash === -1) {
      const dirPath = path.join(dir, file.path)
      // Check to see if the result is a directory
      if (file.content) {
        file.content.pipe(fs.createWriteStream(dirPath))
          .once('error', cb)
          .once('end', cb)
      } else {
        ensureDir(dirPath, cb)
      }
    } else {
      const filePath = file.path.substring(0, lastSlash + 1)
      const dirPath = path.join(dir, filePath)

      ensureDir(dirPath, (err) => {
        if (err) {
          return cb(err)
        }

        if (file.content) {
          const filename = file.path.substring(lastSlash)
          const target = path.join(dirPath, filename)

          file.content.pipe(fs.createWriteStream(target))
            .once('error', cb)
            .once('end', cb)
          return
        }
        cb()
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
    const ipfsPath = argv['ipfs-path']
    const dir = checkArgs(ipfsPath, argv.output)

    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }

      ipfs.files.get(ipfsPath, (err, stream) => {
        if (err) {
          throw err
        }
        console.log(`Saving file(s) to ${ipfsPath}`)
        pull(
          toPull.source(stream),
          pull.asyncMap(fileHandler(dir)),
          pull.onEnd((err) => {
            if (err) {
              throw err
            }
          })
        )
      })
    })
  }
}
