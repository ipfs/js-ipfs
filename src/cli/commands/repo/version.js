var Command = require('ronin').Command
var IPFS = require('../../../ipfs-core')

module.exports = Command.extend({
  desc: 'Shows IPFS repo version information',

  options: {
  },

  run: function (name) {
    var node = new IPFS()
    node.repo.version(function (err, version) {
      if (err) {
        return console.error(err)
      }
      console.log(version)
    })
  }
})
