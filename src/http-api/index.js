var Hapi = require('hapi')
var IPFS = require('../ipfs-core')
var debug = require('debug')
var log = debug('api')

exports = module.exports

exports.start = function (callback) {
  // start IPFS and exports.ipfs = new IPFS()

  exports.ipfs = new IPFS()

  var server = exports.server = new Hapi.Server({
    connections: {
      routes: {
        cors: true
      }
    }
  })

  server.connection({
    port: 9000
  })

  // load routes
  require('./routes/version.js')

  server.start(function (err) {
    if (err) { return callback(err) }
    log('server started: ' + server.info.uri)
    callback()
  })
}

exports.stop = function () {

}
