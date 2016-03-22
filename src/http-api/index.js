'use strict'

const Hapi = require('hapi')
const IPFS = require('../core')
const debug = require('debug')
const fs = require('fs')
const os = require('os')
const log = debug('api')
log.error = debug('api:error')

exports = module.exports

exports.start = (callback) => {
  const ipfs = exports.ipfs = new IPFS()
  ipfs.load(() => {
    const repoPath = process.env.IPFS_PATH || os.homedir() + '/.ipfs'
    try {
      fs.statSync(repoPath + '/api')
      console.log('This repo is currently being used by another daemon')
      process.exit(1)
    } catch (err) {
      fs.writeFileSync(repoPath + '/api', 'api is on by js-ipfs', {flag: 'w+'})
    }

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

      // for the CLI to know the where abouts of the API
      fs.writeFileSync(repoPath + '/api', config.Addresses.API)

      // select which connection with server.select(<label>) to add routes
      server.connection({ host: api[2], port: api[4], labels: 'API' })
      server.connection({ host: gateway[2], port: gateway[4], labels: 'Gateway' })

      // load routes
      require('./routes')(server)

      ipfs.libp2p.start(() => {
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
    })
  })
}

exports.stop = (callback) => {
  const repoPath = process.env.IPFS_PATH || os.homedir() + '/.ipfs'
  fs.unlinkSync(repoPath + '/api')
  exports.ipfs.libp2p.stop(() => {
    exports.server.stop(callback)
  })
}
