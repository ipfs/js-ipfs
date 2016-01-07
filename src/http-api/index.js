'use strict'

const Hapi = require('hapi')
const IPFS = require('../ipfs-core')
const debug = require('debug')
let log = debug('api')
log.error = debug('api:error')

exports = module.exports

exports.start = callback => {
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

  server.start(err => {
    if (err) { return callback(err) }
    log('server started: ' + server.info.uri)
    callback()
  })
}

exports.stop = () => {

}
