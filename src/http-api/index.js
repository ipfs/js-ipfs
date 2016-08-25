'use strict'

const parallel = require('run-parallel')
const Hapi = require('hapi')
const debug = require('debug')
const fs = require('fs')
const path = require('path')
const IPFSRepo = require('ipfs-repo')
const multiaddr = require('multiaddr')
const Store = require('fs-pull-blob-store')

const log = debug('api')
log.error = debug('api:error')

const IPFS = require('../core')

exports = module.exports = function HttpApi (repo) {
  this.ipfs = null
  this.server = null

  this.start = (callback) => {
    if (typeof repo === 'string') {
      repo = new IPFSRepo(repo, {stores: Store})
    }

    this.ipfs = new IPFS(repo)

    console.log('Starting at %s', this.ipfs.repo.path())

    this.ipfs.load(() => {
      const repoPath = this.ipfs.repo.path()
      const apiPath = path.join(repoPath, 'api')

      try {
        fs.statSync(apiPath)
        console.log('This repo is currently being used by another daemon')
        process.exit(1)
      } catch (err) {
        fs.writeFileSync(apiPath, 'api is on by js-ipfs', {flag: 'w+'})
      }

      this.ipfs.config.get((err, config) => {
        if (err) {
          return callback(err)
        }

        // TODO: set up cors correctly, following config
        this.server = new Hapi.Server({
          connections: {
            routes: {
              cors: true
            }
          }
        })
        this.server.app.ipfs = this.ipfs
        const api = config.Addresses.API.split('/')
        const gateway = config.Addresses.Gateway.split('/')

        // for the CLI to know the where abouts of the API
        fs.writeFileSync(apiPath, config.Addresses.API)

        // select which connection with server.select(<label>) to add routes
        this.server.connection({
          host: api[2],
          port: api[4],
          labels: 'API'
        })

        this.server.connection({
          host: gateway[2],
          port: gateway[4],
          labels: 'Gateway'
        })

        // load routes
        require('./routes')(this.server)

        this.ipfs.goOnline(() => {
          this.server.start((err) => {
            if (err) {
              return callback(err)
            }
            const api = this.server.select('API')
            const gateway = this.server.select('Gateway')
            this.apiMultiaddr = multiaddr('/ip4/127.0.0.1/tcp/' + api.info.port)
            console.log('API is listening on: %s', api.info.uri)
            console.log('Gateway (readonly) is listening on: %s', gateway.info.uri)
            callback()
          })
        })
      })
    })
  }

  this.stop = (callback) => {
    const repoPath = this.ipfs.repo.path()
    fs.unlinkSync(path.join(repoPath, 'api'))

    console.log('Stopping server')

    parallel([
      (cb) => this.server.stop(cb),
      (cb) => this.ipfs.goOffline(cb)
    ], (err) => {
      if (err) {
        console.log('There were errors stopping')
      }
      callback()
    })
  }
}
