'use strict'

const Command = require('ronin').Command
const utils = require('../../utils')
const debug = require('debug')
const log = debug('cli:version')
log.error = debug('cli:version:error')
const bs58 = require('bs58')
const streamifier = require('streamifier')
const fs = require('fs')
const async = require('async')
const pathj = require('path')

function addStream (pair) {
  utils.getIPFS((err, ipfs) => {
    if (err) {
      throw err
    }
    if (utils.isDaemonOn()) {
      throw new Error('daemon running is not supported yet')
      /*return ipfs.add(pair.stream, (err, res) => {
        if (err) {
          log.error(err)
          throw err
        }
        console.log('added', res[0].Hash)
      })*/
    }
    console.log(pair.path)
    ipfs.files.add(pair, (err, res) => {
      if (err) {
        throw err
      }
      res.on('file', (file) => {
        console.log('added', bs58.encode(file.multihash).toString(), file.path)
      })
      res.finish()
    })
  })
}


function addDir (path) {
  const files = fs.readdirSync(path)
  //console.log(path)
  async.forEachSeries(files, (res, callback) => {
    var nestedPath = pathj.join(path, res)
    const l = process.cwd().length
    const filepath = nestedPath.substring(l + 1, nestedPath.length)
    //console.log(filepath)
    const stat = fs.statSync(nestedPath)
    if (stat.isFile()) {
      const buffered = fs.readFileSync(nestedPath)
      const r = streamifier.createReadStream(buffered)
      const filePair = {path: filepath, stream: r}
      addStream(filePair)
    }
    if (stat.isDirectory()) {
      addDir(nestedPath)
    }
    callback()
  }, (err) => {
    if (err) {
      throw err
    }
    console.log('done')
    return
  })
}

function readPath (recursive, path) {
  console.log(utils.isDaemonOn())
  //console.log(path)
  const stats = fs.statSync(path)
  if (stats.isFile()) {
    const buffered = fs.readFileSync(path)
    const r = streamifier.createReadStream(buffered)
    path = path.substring(path.lastIndexOf('/') + 1, path.length)
    const filePair = {path: path, stream: r}
    addStream(filePair)
  } else if (stats.isDirectory() && recursive) {
    addDir(path)
  }
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

  run: (recursive, path) => {
    if (!path) {
      throw new Error('Error: Argument \'path\' is required')
    }
    if (path === '.' && recursive === false) {
      console.log('Error: ' + path + ' is a directory, use the \'-r\' flag to specify directories')
    } else if (path === '.' && recursive === true) {
      path = process.cwd()
    }
    readPath(recursive, path)

    // console.log(utils.isDaemonOn())
    // utils.getIPFS((err, ipfs) => {
    //   if (err) {
    //     throw err
    //   }
    //   //console.log(ipfs)
    //   if (path.charAt(0) !== '/') {
    //     path = process.cwd() + '/' + path
    //   }
    //   ipfs.files.add(path, {
    //     recursive: recursive
    //   }, (err, stats) => {
    //     if (err) {
    //       return console.log(err)
    //     }
    //     if (stats) {
    //       console.log('added', bs58.encode(stats.Hash).toString(), stats.Name)
    //     }
    //   })
    // })
  }
})
