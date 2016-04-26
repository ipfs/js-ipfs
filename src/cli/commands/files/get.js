const Command = require('ronin').Command
const debug = require('debug')
const IPFS = require('../../../core')
const log = debug('cli:files')
log.error = debug('cli:files:error')
var fs = require('fs')

module.exports = Command.extend({
  desc: 'Download IPFS objects',

  options: {},

  run: (path, options) => {
    var node = new IPFS()
    if (!path) {
      throw new Error("Argument 'path' is required")
    }
    if (!options) {
      options = {}
      var dir = process.cwd()
    } else {
      if (options.slice(-1) !== '/') {
        options += '/'
      }
      dir = options
    }
    node.files.get(path, (err, data) => {
      if (err) {
        throw new Error(err)
      }
      data.on('file', (data) => {
        if (data.path.lastIndexOf('/') === -1) {
          var filepath = data.path
          if (data.dir === false) {
            var ws = fs.createWriteStream(dir + data.path)
            data.stream.pipe(ws)
          } else {
            try {
              fs.mkdirSync(dir + filepath)
            } catch (err) {
              console.log(err)
            }
          }
        } else {
          filepath = data.path.substring(0, data.path.lastIndexOf('/') + 1)
          try {
            fs.mkdirSync(dir + filepath)
          } catch (err) {
          }
          ws = fs.createWriteStream(dir + data.path)
          data.stream.on('end', () => {
            console.log('finished writing file to disk')
          })
          data.stream.pipe(ws)
        }
      })
    })
  }
})
