'use strict'

const parallel = require('async/parallel')
const Hapi = require('hapi')
const debug = require('debug')
const fs = require('fs')
const path = require('path')
const IPFSRepo = require('ipfs-repo')
const multiaddr = require('multiaddr')
const Store = require('fs-pull-blob-store')
const setHeader = require('hapi-set-header')

const log = debug('api')
log.error = debug('api:error')

const IPFS = require('../core')
const errorHandler = require('./error-handler')

function uriToMultiaddr (uri) {
  const ipPort = uri.split('/')[2].split(':')
  return `/ip4/${ipPort[0]}/tcp/${ipPort[1]}`
}

exports = module.exports = function HttpApi (repo) {
  this.ipfs = null
  this.server = null

  this.start = (callback) => {
    if (typeof repo === 'string') {
      repo = new IPFSRepo(repo, {stores: Store})
    }

    this.ipfs = new IPFS({
      repo: repo,
      EXPERIMENTAL: {
        pubsub: true
      }
    })

    const repoPath = this.ipfs.repo.path()

    try {
      fs.statSync(repoPath)
    } catch (err) {
      return callback(err)
    }

    console.log('Starting at %s', this.ipfs.repo.path())

    this.ipfs.load(() => {
      const apiPath = path.join(repoPath, 'api')

      try {
        fs.statSync(apiPath)
        console.log('This repo is currently being used by another daemon')
        process.exit(1)
      } catch (err) {}

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

        // Nicer errors
        errorHandler(this.server)

        // load routes
        require('./routes')(this.server)

        // Set default headers
        setHeader(this.server, 'Access-Control-Allow-Headers', 'X-Stream-Output, X-Chunked-Output, X-Content-Length')
        setHeader(this.server, 'Access-Control-Expose-Headers', 'X-Stream-Output, X-Chunked-Output, X-Content-Length')

        this.ipfs.goOnline(() => {
          this.server.start((err) => {
            if (err) {
              return callback(err)
            }
            const api = this.server.select('API')
            const gateway = this.server.select('Gateway')
            this.apiMultiaddr = multiaddr('/ip4/127.0.0.1/tcp/' + api.info.port)
            api.info.ma = uriToMultiaddr(api.info.uri)
            gateway.info.ma = uriToMultiaddr(gateway.info.uri)

            console.log('API is listening on: %s', api.info.ma)
            console.log('Gateway (readonly) is listening on: %s', gateway.info.ma)

            // for the CLI to know the where abouts of the API
            fs.writeFileSync(apiPath, api.info.ma)

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
