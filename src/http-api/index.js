'use strict'

const Hapi = require('hapi')
const IPFS = require('../ipfs-core')
const debug = require('debug')
const log = debug('api')
log.error = debug('api:error')

exports = module.exports

exports.start = callback => {
  // start IPFS and exports.ipfs = new IPFS()

  const ipfs = exports.ipfs = new IPFS()

  ipfs.config.show((err, config) => {
    if (err) {
      return callback(err)
    }

    // TODO: set up cors correctly, following config
    var server = exports.server = new Hapi.Server({
      connections: {
        routes: {
          cors: true
        }
      }
    })
    const api = config.Addresses.API.split('/')
    const gateway = config.Addresses.Gateway.split('/')

    // select which connection with server.select(<label>) to add routes
    server.connection({ host: api[2], port: api[4], labels: 'API' })
    server.connection({ host: gateway[2], port: gateway[4], labels: 'Gateway' })

    // load routes
    require('./routes')

    server.start((err) => {
      if (err) {
        return callback(err)
      }
      const api = server.select('API')
      const gateway = server.select('Gateway')
      console.log('API is listening on: ' + api.info.uri)
      console.log('Gateway (readonly) is listening on: ' + gateway.info.uri)
      callback()
    })
  })
}

exports.stop = callback => {
  exports.server.stop(callback)
}
