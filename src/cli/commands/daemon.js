var Command = require('ronin').Command
var httpAPI = require('../../http-api')

module.exports = Command.extend({
  desc: 'Start a long-running daemon process',

  run: function (name) {
    httpAPI.start()
    // start API, using core
    //
  }
})
