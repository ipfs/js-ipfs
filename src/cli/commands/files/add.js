'use strict'

const Command = require('ronin').Command
const utils = require('../../utils')
const debug = require('debug')
const log = debug('cli:version')
log.error = debug('cli:version:error')
const bs58 = require('bs58')
const Readable = require('stream').Readable
const fs = require('fs')
const async = require('async')
const pathj = require('path')
const glob = require('glob')

module.exports = Command.extend({
  desc: 'Add a file to IPFS using the UnixFS data format',

  options: {
    recursive: {
      alias: 'r',
      type: 'boolean',
      default: false
    }
  },

  run: (recursive, path) => {
    let s
    let rs

    if (!path) {
      throw new Error('Error: Argument \'path\' is required')
    }

    s = fs.statSync(path)

    if (s.isDirectory() && recursive === false) {
      throw new Error('Error: ' + process.cwd() + ' is a directory, use the \'-r\' flag to specify directories')
    }
    if (path === '.' && recursive === true) {
      path = process.cwd()
      s = fs.statSync(process.cwd())
    } else if (path === '.' && recursive === false) {
      s = fs.statSync(process.cwd())
      if (s.isDirectory()) {
        throw new Error('Error: ' + process.cwd() + ' is a directory, use the \'-r\' flag to specify directories')
      }
    }

    glob(pathj.join(path, '/**/*'), (err, res) => {
      if (err) {
        throw new Error(err)
      }
      utils.getIPFS((err, ipfs) => {
        if (err) {
          throw new Error(err)
        }
        var files = []
        if (utils.isDaemonOn()) {
          if (res.length !== 0) {
            const index = path.lastIndexOf('/')
            async.eachLimit(res, 10, (element, callback) => {
              rs = new Readable()
              const addPath = element.substring(index + 1, element.length)
              if (fs.statSync(element).isDirectory()) {
                callback()
              } else {
                const buffered = fs.readFileSync(element)
                rs.push(buffered)
                rs.push(null)
                const filePair = {path: addPath, content: rs}
                files.push(filePair)
                callback()
              }
            }, (err) => {
              if (err) {
                throw new Error(err)
              }
              ipfs.add(files, (err, res) => {
                if (err) {
                  throw new Error(err)
                }
                res.forEach((goRes) => {
                  console.log('added', goRes.Hash, goRes.Name)
                })
              })
            })
          } else {
            rs = new Readable()
            const buffered = fs.readFileSync(path)
            rs.push(buffered)
            rs.push(null)
            path = path.substring(path.lastIndexOf('/') + 1, path.length)
            const filePair = {path: path, content: rs}
            files.push(filePair)
            ipfs.add(files, (err, res) => {
              if (err) {
                throw new Error(err)
              }
              console.log('added', res[0].Hash, res[0].Name)
            })
          }
          return
        }
        const i = ipfs.files.add()
        i.on('data', (file) => {
          console.log('added', bs58.encode(file.multihash).toString(), file.path)
        })
        if (res.length !== 0) {
          const index = path.lastIndexOf('/')
          async.eachLimit(res, 10, (element, callback) => {
            rs = new Readable()
            const addPath = element.substring(index + 1, element.length)
            if (fs.statSync(element).isDirectory()) {
              callback()
            } else {
              const buffered = fs.readFileSync(element)
              rs.push(buffered)
              rs.push(null)
              const filePair = {path: addPath, stream: rs}
              i.write(filePair)
              callback()
            }
          }, (err) => {
            if (err) {
              throw new Error(err)
            }
            i.end()
            return
          })
        } else {
          rs = new Readable()
          const buffered = fs.readFileSync(path)
          path = path.substring(path.lastIndexOf('/') + 1, path.length)
          rs.push(buffered)
          rs.push(null)
          const filePair = {path: path, stream: rs}
          i.write(filePair)
          i.end()
        }
      })
    })
  }
})
