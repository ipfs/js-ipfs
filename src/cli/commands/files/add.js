'use strict'

const Command = require('ronin').Command
const utils = require('../../utils')
const debug = require('debug')
const log = debug('cli:version')
log.error = debug('cli:version:error')
const bs58 = require('bs58')
const fs = require('fs')
const parallelLimit = require('run-parallel-limit')
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

  if (inPath === '.') {
    inPath = process.cwd()
  }

  if (fs.statSync(inPath).isDirectory() && recursive === false) {
    throw new Error(`Error: ${inPath} is a directory, use the '-r' flag to specify directories`)
  }

  return inPath
}

function daemonOn (res, inPath, ipfs) {
  const files = []
  if (res.length !== 0) {
    const index = inPath.lastIndexOf('/')
    async.eachLimit(res, 10, (element, callback) => {
      if (fs.statSync(element).isDirectory()) {
        callback()
      } else {
        const filePair = {
          path: element.substring(index + 1, element.length),
          content: fs.createReadStream(element)
        }
        files.push(filePair)
        callback()
      }
    }, (err) => {
      if (err) {
        throw err
      }
      ipfs.add(files, (err, res) => {
        if (err) {
          throw err
        }
        res.forEach((goRes) => {
          console.log('added', goRes.Hash, goRes.Name)
        })
      })
    })
  } else {
    const filePair = {
      path: inPath.substring(inPath.lastIndexOf('/') + 1, inPath.length),
      content: fs.createReadStream(inPath)
    }
    files.push(filePair)
    ipfs.add(files, (err, res) => {
      if (err) {
        throw err
      }
      console.log('added', res[0].Hash, res[0].Name)
    })
  }
  return
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
        if (utils.isDaemonOn()) {
          daemonOn(res, inPath, ipfs)
        } else {
          ipfs.files.add((err, i) => {
            if (err) {
              throw err
            }
            var filePair
            i.on('data', (file) => {
              console.log('added', bs58.encode(file.multihash).toString(), file.path)
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
                    stream: fs.createReadStream(element)
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
              filePair = {path: inPath, stream: rs}
              i.write(filePair)
              i.end()
            }
          })
        }
      })
    })
  }
})
