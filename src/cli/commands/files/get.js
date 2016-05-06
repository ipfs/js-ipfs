'use strict'

const Command = require('ronin').Command
const debug = require('debug')
const utils = require('../../utils')
const log = debug('cli:files')
log.error = debug('cli:files:error')
var fs = require('fs')
const pathj = require('path')

module.exports = Command.extend({
  desc: 'Download IPFS objects',

  run: (path, outPath) => {
    let dir
    let filepath
    let ws

    if (!path) {
      throw new Error("Argument 'path' is required")
    }
    if (!outPath) {
      outPath = {}
      dir = process.cwd()
    } else {
      if (outPath.slice(-1) !== '/') {
        outPath += '/'
      }
      dir = outPath
    }

    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }
      ipfs.files.get(path, (err, data) => {
        if (err) {
          throw err
        }
        data.on('file', (data) => {
          if (data.path.lastIndexOf('/') === -1) {
            filepath = data.path
            if (data.dir === false) {
              ws = fs.createWriteStream(pathj.join(dir, data.path))
              data.stream.pipe(ws)
            } else {
              try {
                fs.mkdirSync(pathj.join(dir, data.path))
              } catch (err) {
                throw err
              }
            }
          } else {
            filepath = data.path.substring(0, data.path.lastIndexOf('/') + 1)
            try {
              fs.mkdirSync(pathj.join(dir, filepath))
            } catch (err) {
              throw err
            }
            ws = fs.createWriteStream(pathj.join(dir, data.path))
            data.stream.pipe(ws)
          }
        })
      })
    })
  }
})
