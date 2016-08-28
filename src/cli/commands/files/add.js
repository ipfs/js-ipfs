'use strict'

const utils = require('../../utils')
const debug = require('debug')
const log = debug('cli:version')
log.error = debug('cli:version:error')
const fs = require('fs')
const path = require('path')
const glob = require('glob')
const sortBy = require('lodash.sortby')
const mapLimit = require('map-limit')

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

module.exports = command

const command = {
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
    let inPath = checkPath(argv.file, argv.recursive)

    utils.getIPFS(gotIPFS)

    function gotIPFS (err, ipfs) {
      if (err) {
        throw err
      }

      glob(path.join(inPath, '/**/*'), (err, res) => {
        if (err) {
          throw err
        }

        ipfs.files.createAddStream((err, i) => {
          if (err) {
            throw err
          }
          const added = []

          i.on('data', (file) => {
            added.push({
              hash: file.hash,
              path: file.path
            })
          })

          i.on('end', () => {
            sortBy(added, 'path')
              .reverse()
              .map((file) => `added ${file.hash} ${file.path}`)
              .forEach((msg) => console.log(msg))
          })

          if (res.length === 0) {
            res = [inPath]
          }

          const writeToStream = (stream, element) => {
            const index = inPath.lastIndexOf('/') + 1
            i.write({
              path: element.substring(index, element.length),
              content: fs.createReadStream(element)
            })
          }

          mapLimit(res, 50, (file, cb) => {
            fs.stat(file, (err, stat) => {
              if (err) {
                return cb(err)
              }
              return cb(null, {
                path: file,
                isDirectory: stat.isDirectory()
              })
            })
          }, (err, res) => {
            if (err) {
              throw err
            }

            res
              .filter((elem) => !elem.isDirectory)
              .map((elem) => elem.path)
              .forEach((elem) => writeToStream(i, elem))

            i.end()
          })
        })
      })
    }
  }
}
