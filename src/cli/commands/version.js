var Command = require('ronin').Command
var IPFS = require('../../ipfs-core')
var debug = require('debug')
var log = debug('cli:version')
log.error = debug('cli:version:error')

module.exports = Command.extend({
  desc: 'Shows IPFS version information',

  options: {
    number: {
      alias: 'n',
      type: 'boolean',
      default: false
    },
    commit: {
      type: 'boolean',
      default: false
    },
    repo: {
      type: 'boolean',
      default: false
    }
  },

  run: function (name) {
    var node = new IPFS()
    node.version(function (err, version) {
      if (err) { return log.error(err) }

      console.log(version)
    })
  }
})
