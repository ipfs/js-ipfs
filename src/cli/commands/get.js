'use strict'

var fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const pull = require('pull-stream')
const toPull = require('stream-to-pull-stream')

function checkArgs (hash, outPath) {
  // format the output directory
  if (!outPath.endsWith(path.sep)) {
    outPath += path.sep
  }

  return outPath
}

function ensureDirFor (dir, file, callback) {
  const lastSlash = file.path.lastIndexOf('/')
  const filePath = file.path.substring(0, lastSlash + 1)
  const dirPath = path.join(dir, filePath)
  mkdirp(dirPath, callback)
}

function fileHandler (dir) {
  return function onFile (file, callback) {
    ensureDirFor(dir, file, (err) => {
      if (err) {
        callback(err)
      } else {
        const fullFilePath = path.join(dir, file.path)

        if (file.content) {
          file.content
            .pipe(fs.createWriteStream(fullFilePath))
            .once('error', callback)
            .once('finish', callback)
        } else {
          // this is a dir
          mkdirp(fullFilePath, callback)
        }
      }
    })
  }
}

module.exports = {
  command: 'get <ipfsPath>',

  describe: 'Fetch a file or directory with files references from an IPFS Path',

  builder: {
    output: {
      alias: 'o',
      type: 'string',
      default: process.cwd()
    }
  },

  handler ({ getIpfs, print, ipfsPath, output, resolve }) {
    resolve((async () => {
      const ipfs = await getIpfs()

      return new Promise((resolve, reject) => {
        const dir = checkArgs(ipfsPath, output)
        const stream = ipfs.getReadableStream(ipfsPath)

        print(`Saving file(s) ${ipfsPath}`)
        pull(
          toPull.source(stream),
          pull.asyncMap(fileHandler(dir)),
          pull.onEnd((err) => {
            if (err) return reject(err)
            resolve()
          })
        )
      })
    })())
  }
}
