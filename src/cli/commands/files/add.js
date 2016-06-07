'use strict'

const Command = require('ronin').Command
const utils = require('../../utils')
const debug = require('debug')
const log = debug('cli:version')
log.error = debug('cli:version:error')
const bs58 = require('bs58')
const fs = require('fs')
const parallelLimit = require('run-parallel-limit')
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

  if (inPath === '.') {
    inPath = process.cwd()
  }

  if (fs.statSync(inPath).isDirectory() && recursive === false) {
    throw new Error(`Error: ${inPath} is a directory, use the '-r' flag to specify directories`)
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
        ipfs.files.createAddStream((err, i) => {
          if (err) throw err
          var filePair
          i.on('data', (file) => {
            console.log('added', bs58.encode(file.node.multihash()).toString(), file.path)
          })
          i.once('end', () => {
            return
          })
          if (res.length !== 0) {
            const index = inPath.lastIndexOf('/')
            parallelLimit(res.map((element) => (callback) => {
              if (!fs.statSync(element).isDirectory()) {
                i.write({
                  path: element.substring(index + 1, element.length),
                  content: fs.createReadStream(element)
                })
              }
              callback()
            }), 10, (err) => {
              if (err) {
                throw err
              }
              i.end()
            })
          } else {
            rs = fs.createReadStream(inPath)
            inPath = inPath.substring(inPath.lastIndexOf('/') + 1, inPath.length)
            filePair = {path: inPath, content: rs}
            i.write(filePair)
            i.end()
          }
        })
      })
    })
  }
})
