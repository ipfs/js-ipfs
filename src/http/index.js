'use strict'

const series = require('async/series')
const Hapi = require('hapi')
const debug = require('debug')
const multiaddr = require('multiaddr')
const setHeader = require('hapi-set-header')
const once = require('once')

const IPFS = require('../core')
const WStar = require('libp2p-webrtc-star')
const errorHandler = require('./error-handler')

function uriToMultiaddr (uri) {
  const ipPort = uri.split('/')[2].split(':')
  return `/ip4/${ipPort[0]}/tcp/${ipPort[1]}`
}

function HttpApi (repo, config, cliArgs) {
  this.node = undefined
  this.server = undefined

  this.log = debug('jsipfs:http-api')
  this.log.error = debug('jsipfs:http-api:error')

  if (process.env.IPFS_MONITORING) {
    // Setup debug metrics collection
    const prometheusClient = require('prom-client')
    const prometheusGcStats = require('prometheus-gc-stats')
    const collectDefaultMetrics = prometheusClient.collectDefaultMetrics
    collectDefaultMetrics({ timeout: 5000 })
    prometheusGcStats(prometheusClient.register)()
  }

  this.start = (init, callback) => {
    if (typeof init === 'function') {
      callback = init
      init = false
    }
    this.log('starting')

    series([
      (cb) => {
        cb = once(cb)

        const libp2p = { modules: {} }

        // Attempt to use any of the WebRTC versions available globally
        let electronWebRTC
        let wrtc
        try { electronWebRTC = require('electron-webrtc')() } catch (err) {}
        try { wrtc = require('wrtc') } catch (err) {}

        if (wrtc || electronWebRTC) {
          const using = wrtc ? 'wrtc' : 'electron-webrtc'
          console.log(`Using ${using} for webrtc support`)
          const wstar = new WStar({ wrtc: (wrtc || electronWebRTC) })
          libp2p.modules.transport = [wstar]
          libp2p.modules.discovery = [wstar.discovery]
        }

        // try-catch so that programmer errors are not swallowed during testing
        try {
          // start the daemon
          this.node = new IPFS({
            repo: repo,
            init: init,
            start: true,
            config: config,
            EXPERIMENTAL: {
              pubsub: cliArgs && cliArgs.enablePubsubExperiment,
              sharding: cliArgs && cliArgs.enableShardingExperiment
            },
            libp2p: libp2p
          })
        } catch (err) {
          return cb(err)
        }

        this.node.once('error', (err) => {
          this.log('error starting core', err)
          err.code = 'ENOENT'
          cb(err)
        })
        this.node.once('start', cb)
      },
      (cb) => {
        this.log('fetching config')
        this.node._repo.config.get((err, config) => {
          if (err) {
            return callback(err)
          }

          // CORS is enabled by default
          // TODO: shouldn't, fix this
          this.server = new Hapi.Server({
            connections: {
              routes: {
                cors: true
              }
            }
          })

          this.server.app.ipfs = this.node
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
          errorHandler(this, this.server)

          // load routes
          require('./api/routes')(this.server)
          // load gateway routes
          require('./gateway/routes')(this.server)

          // Set default headers
          setHeader(this.server,
            'Access-Control-Allow-Headers',
            'X-Stream-Output, X-Chunked-Output, X-Content-Length')
          setHeader(this.server,
            'Access-Control-Expose-Headers',
            'X-Stream-Output, X-Chunked-Output, X-Content-Length')

          this.server.start(cb)
        })
      },
      (cb) => {
        const api = this.server.select('API')
        const gateway = this.server.select('Gateway')
        this.apiMultiaddr = multiaddr('/ip4/127.0.0.1/tcp/' + api.info.port)
        api.info.ma = uriToMultiaddr(api.info.uri)
        gateway.info.ma = uriToMultiaddr(gateway.info.uri)

        console.log('API is listening on: %s', api.info.ma)
        console.log('Gateway (readonly) is listening on: %s', gateway.info.ma)

        // for the CLI to know the where abouts of the API
        this.node._repo.apiAddr.set(api.info.ma, cb)
      }
    ], (err) => {
      this.log('done', err)
      callback(err)
    })
  }

  this.stop = (callback) => {
    this.log('stopping')
    series([
      (cb) => this.server.stop(cb),
      (cb) => this.node.stop(cb)
    ], (err) => {
      if (err) {
        this.log.error(err)
        console.log('There were errors stopping')
      }
      callback()
    })
  }
}

module.exports = HttpApi
