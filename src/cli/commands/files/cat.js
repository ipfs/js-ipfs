const Command = require('ronin').Command
const debug = require('debug')
const IPFS = require('../../../core')
const log = debug('cli:files')
log.error = debug('cli:files:error')

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
    }
    node.files.cat(path, (err, res) => {
      if (err) {
        throw new Error(err)
      }
      if (res) {
        res.on('file', (data) => {
          data.stream.pipe(process.stdout)
        })
      }
    })
  }
})
