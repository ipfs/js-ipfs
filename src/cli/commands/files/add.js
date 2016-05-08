'use strict'

const Command = require('ronin').Command
const utils = require('../../utils')
const debug = require('debug')
const log = debug('cli:version')
log.error = debug('cli:version:error')
const bs58 = require('bs58')
const fs = require('fs')
const async = require('async')
const path = require('path')
const glob = require('glob')

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

  var s = fs.statSync(inPath)

  if (s.isDirectory() && recursive === false) {
    throw new Error('Error: ' + process.cwd() + ' is a directory, use the \'-r\' flag to specify directories')
  }
  if (inPath === '.' && recursive === true) {
    inPath = process.cwd()
    return inPath
  } else if (inPath === '.' && recursive === false) {
    s = fs.statSync(process.cwd())
    if (s.isDirectory()) {
      throw new Error('Error: ' + process.cwd() + ' is a directory, use the \'-r\' flag to specify directories')
    }
  }
  return inPath
}

module.exports = Command.extend({
  desc: 'Add a file to IPFS using the UnixFS data format',

  options: {
    recursive: {
      alias: 'r',
      type: 'boolean',
      default: false
    }
  },

  run: (recursive, inPath) => {
    let rs

    inPath = checkPath(inPath, recursive)

    glob(path.join(inPath, '/**/*'), (err, res) => {
      if (err) {
        throw err
      }
      utils.getIPFS((err, ipfs) => {
        if (err) {
          throw err
        }
        const i = ipfs.files.add()
        var filePair
        i.on('data', (file) => {
          console.log('added', bs58.encode(file.multihash).toString(), file.path)
        })
        i.once('end', () => {
          return
        })
        if (res.length !== 0) {
          const index = inPath.lastIndexOf('/')
          async.eachLimit(res, 10, (element, callback) => {
            const addPath = element.substring(index + 1, element.length)
            if (fs.statSync(element).isDirectory()) {
              callback()
            } else {
              rs = fs.createReadStream(element)
              filePair = {path: addPath, stream: rs}
              i.write(filePair)
              callback()
            }
          }, (err) => {
            if (err) {
              throw err
            }
            i.end()
          })
        } else {
          rs = fs.createReadStream(inPath)
          inPath = inPath.substring(inPath.lastIndexOf('/') + 1, inPath.length)
          filePair = {path: inPath, stream: rs}
          i.write(filePair)
          i.end()
        }
      })
    })
  }
})
