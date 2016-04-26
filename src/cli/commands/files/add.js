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
const glob = require("glob")

let rootPath
let filePath
let i

function addStream (pair) {
  i.add(pair)
}


function addDir (path) {
  rootPath = pathj.join(rootPath, path)
  filePath = pathj.join(filePath, path)
  //console.log(rootPath)
  //console.log(filePath)
  const files = fs.readdirSync(rootPath)
  async.forEachSeries(files, (res, callback) => {
    const tempPath = pathj.join(filePath, res)
    const nestedPath = pathj.join(rootPath, res)
    const stat = fs.statSync(nestedPath)
    if (stat.isFile()) {
      const buffered = fs.readFileSync(nestedPath)
      const r = streamifier.createReadStream(buffered)
      const filePair = {path: tempPath, stream: r}
      //addStream(filePair)
      i.add(filePair)
    }
    if (stat.isDirectory()) {
      // TODO check if tempPath is empty, add sentinel empty dir

      addDir(res)
    }
    callback()
  }, (err) => {
    if (err) {
      throw err
    }
    //console.log('done')
    return
  })
}

function choosePath (recursive, path, stats) {
  //console.log(utils.isDaemonOn())
  //console.log(path)
  if (stats.isFile()) {
    const buffered = fs.readFileSync(path)
    const r = streamifier.createReadStream(buffered)
    path = path.substring(path.lastIndexOf('/') + 1, path.length)
    const filePair = {path: path, stream: r}
    //addStream(filePair)
    i.add(filePair)
  } else if (stats.isDirectory()) {
    console.log(path)
    rootPath = path
    filePath = path.substring(path.lastIndexOf('/') + 1, path.length)
    addDir('')
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
    let s

    if (!path) {
      throw new Error('Error: Argument \'path\' is required')
    }
    
    s = fs.statSync(path)

    if (s.isDirectory() && recursive == false) {
      throw new Error('Error: ' + process.cwd() + ' is a directory, use the \'-r\' flag to specify directories')
    } 
    if(path === '.' && recursive === true) {
      path = process.cwd()
      s = fs.statSync(process.cwd())
    } else if (path === '.' && recursive === false) {
      s = fs.statSync(process.cwd())
      if (s.isDirectory()) {
        throw new Error('Error: ' + process.cwd() + ' is a directory, use the \'-r\' flag to specify directories')
      }
    }

    glob(pathj.join(path,'/**/*'), (err, res) => {
      if (res.length === 0) {
        res = pathj.join(process.cwd(), path)
      }
      utils.getIPFS((err, ipfs) => {
        if (err) {
          throw err
        }
        if (utils.isDaemonOn()) {
          throw new Error('daemon running is not supported yet')
          // TODO create files.add js-ipfs-api 
          /*return ipfs.add(pair.stream, (err, res) => {
            if (err) {
              log.error(err)
              throw err
            }
            console.log('added', res[0].Hash)
          })*/
        }
        const i = ipfs.files.add()
        i.on('data', (file) => {
          console.log('added', bs58.encode(file.multihash).toString(), file.path)
        })
        if (res.length !== 0) {
          const index = path.lastIndexOf('/')
          async.eachLimit(res, 10, (element, callback) => {
            const addPath = element.substring(index + 1, element.length)
            //console.log(element)
            if (fs.statSync(element).isDirectory()) {
              const filePair = {path: addPath}
              i.write(filePair)
              callback()
            } else {
              const buffered = fs.readFileSync(element)
              const r = streamifier.createReadStream(buffered)
              const filePair = {path: addPath, stream: r}
              i.write(filePair)
              callback()
            }
          }, (err) => {
            if (err) {
              throw err
            }
            i.end()
            return
          })
        } else {
          const buffered = fs.readFileSync(path)
          const r = streamifier.createReadStream(buffered)
          const filePair = {path: path, stream: r}
          i.write(filePair)
          i.end()
        }
      })      
    })

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
