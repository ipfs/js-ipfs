var Command = require('ronin').Command
var IPFS = require('../../ipfs-core')

module.exports = Command.extend({
  desc: 'Shows IPFS Node ID info',

  options: {
    format: {
      alias: 'f',
      type: 'string'
    }
  },

  run: function (name) {
    var node = new IPFS()
    node.id(function (err, id) {
      if (err) {
        return console.error(err)
      }
      console.log(id)
    })
  }
})
