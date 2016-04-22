'use strict'

const Hapi = require('hapi')
const IPFS = require('../core')
const debug = require('debug')
const fs = require('fs')
const path = require('path')
const log = debug('api')
log.error = debug('api:error')
const IPFSRepo = require('ipfs-repo')
const fsbs = require('fs-blob-store')

exports = module.exports

exports.start = (repo, callback) => {
  if (typeof repo === 'function') {
    callback = repo
    repo = undefined
  }

  if (typeof repo === 'string') {
    repo = new IPFSRepo(repo, {stores: fsbs})
  }

  const ipfs = exports.ipfs = new IPFS(repo)
  console.log('Starting at %s', ipfs.repo.path())
  ipfs.load(() => {
    const repoPath = ipfs.repo.path()
    const apiPath = path.join(repoPath, 'api')
    console.log('Finished loading')
    try {
      fs.statSync(apiPath)
      console.log('This repo is currently being used by another daemon')
      process.exit(1)
    } catch (err) {
      fs.writeFileSync(apiPath, 'api is on by js-ipfs', {flag: 'w+'})
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
      fs.writeFileSync(apiPath, config.Addresses.API)

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
          console.log('API is listening on: %s', api.info.uri)
          console.log('Gateway (readonly) is listening on: %s', gateway.info.uri)
          callback()
        })
      })
    })
  })
}

exports.stop = (callback) => {
  const repoPath = exports.ipfs.repo.path()

  fs.unlinkSync(path.join(repoPath, 'api'))

  console.log('->', 'going to stop libp2p')

  exports.ipfs.libp2p.stop(() => {
    console.log('->', 'going to stop api server')
    exports.server.stop(callback)
  })
}
