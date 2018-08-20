'use strict'

const Hapi = require('hapi')
const debug = require('debug')
const multiaddr = require('multiaddr')
const setHeader = require('hapi-set-header')
const { promisify } = require('util')
const URL = require('url')

const IPFS = require('../core')
const WStar = require('libp2p-webrtc-star')
const TCP = require('libp2p-tcp')
const MulticastDNS = require('libp2p-mdns')
const WS = require('libp2p-websockets')
const Bootstrap = require('libp2p-bootstrap')
const errorHandler = require('./error-handler')

const log = debug('jsipfs:http-api')
log.error = debug('jsipfs:http-api:error')

function uriToMultiaddr (uri) {
  uri = new URL(uri)
  return `/ip4/${uri.host}/tcp/${uri.port}`
}

class HttpApi {
  constructor (repo, config, cliArgs) {
    this.node = null
    this.servers = { api: null, gateway: null }

    this._options = { repo, config, cliArgs }

    if (process.env.IPFS_MONITORING) {
      // Setup debug metrics collection
      const prometheusClient = require('prom-client')
      const prometheusGcStats = require('prometheus-gc-stats')
      prometheusClient.collectDefaultMetrics({ timeout: 5000 })
      prometheusGcStats(prometheusClient.register)()
    }
  }

  async start (init) {
    log('starting')

    const node = await this._startNode(init)
    let config

    try {
      await this._getConfig(node)
    } catch (err) {
      log.error(err)
      await node.stop()
      throw err
    }

    let api

    try {
      api = await this._startApiServer(node, config)
      api.info.ma = uriToMultiaddr(api.info.uri)
      this.apiMultiaddr = multiaddr('/ip4/127.0.0.1/tcp/' + api.info.port)
      await promisify((ma, cb) => node._repo.apiAddr.set(ma, cb))(api.info.ma)
      this.servers.api = api
      console.log('API is listening on: %s', api.info.ma)
    } catch (err) {
      log.error(err)
      await node.stop()
      throw err
    }

    let gateway

    try {
      gateway = await this._startGatewayServer(node, config)
      gateway.info.ma = uriToMultiaddr(gateway.info.uri)
      this.servers.gateway = gateway
      console.log('Gateway (readonly) is listening on: %s', gateway.info.ma)
    } catch (err) {
      log.error(err)
      await node.stop()
      await api.stop()
      throw err
    }

    this.node = node
    this.servers = { api, gateway }

    log('done')
  }

  async _startNode (init) {
    const libp2p = { modules: {} }

    // Attempt to use any of the WebRTC versions available globally
    let electronWebRTC
    try { electronWebRTC = require('electron-webrtc')() } catch (err) {}

    let wrtc
    try { wrtc = require('wrtc') } catch (err) {}

    if (wrtc || electronWebRTC) {
      const using = wrtc ? 'wrtc' : 'electron-webrtc'
      console.log(`Using ${using} for webrtc support`)
      const wstar = new WStar({ wrtc: (wrtc || electronWebRTC) })
      libp2p.modules.transport = [TCP, WS, wstar]
      libp2p.modules.peerDiscovery = [MulticastDNS, Bootstrap, wstar.discovery]
    }

    const { repo, config, cliArgs } = this._options

    // start the daemon
    const node = new IPFS({
      repo,
      init,
      start: true,
      config,
      pass: cliArgs.pass,
      EXPERIMENTAL: {
        pubsub: cliArgs.enablePubsubExperiment,
        dht: cliArgs.enableDhtExperiment,
        sharding: cliArgs.enableShardingExperiment
      },
      libp2p
    })

    await new Promise((resolve, reject) => {
      const onStart = () => {
        // remove error listener so future errors aren't swallowed
        node.removeListener('error', onError)
        resolve(node)
      }
      const onError = (err) => {
        log('error starting core', err)
        err.code = 'ENOENT'
        reject(err)
      }
      node.on('start', onStart)
      node.on('error', reject)
    })

    return node
  }

  _getConfig (node) {
    log('fetching config')
    return promisify((cb) => node._repo.config.get(cb))
  }

  async _startApiServer (node, config) {
    const api = config.Addresses.API.split('/')

    // CORS is enabled by default
    // TODO: shouldn't, fix this
    const server = Hapi.Server({
      host: api[2],
      port: api[4],
      connections: {
        routes: {
          cors: true
        }
      },
      debug: process.env.DEBUG ? {
        request: ['*'],
        log: ['*']
      } : undefined,
      app: {
        ipfs: node
      }
    })

    // Nicer errors
    // errorHandler(this, server)

    // load routes
    // require('./api/routes')(server)

    // Set default headers
    setHeader(server,
      'Access-Control-Allow-Headers',
      'X-Stream-Output, X-Chunked-Output, X-Content-Length')
    setHeader(server,
      'Access-Control-Expose-Headers',
      'X-Stream-Output, X-Chunked-Output, X-Content-Length')

    await server.start()
    return server
  }

  async _startGatewayServer (node, config) {
    const gateway = config.Addresses.Gateway.split('/')

    // CORS is enabled by default
    // TODO: shouldn't, fix this
    const server = Hapi.Server({
      host: gateway[2],
      port: gateway[4],
      connections: {
        routes: {
          cors: true
        }
      },
      debug: process.env.DEBUG ? {
        request: ['*'],
        log: ['*']
      } : undefined,
      app: {
        ipfs: node
      }
    })

    // Nicer errors
    // errorHandler(this, server)

    // load gateway routes
    require('./gateway/routes')(server)

    // Set default headers
    setHeader(server,
      'Access-Control-Allow-Headers',
      'X-Stream-Output, X-Chunked-Output, X-Content-Length')
    setHeader(server,
      'Access-Control-Expose-Headers',
      'X-Stream-Output, X-Chunked-Output, X-Content-Length')

    await server.start()
    return server
  }

  async stop (options) {
    log('stopping')

    try {
      await Promise.all([
        this.servers.api.stop(options),
        this.servers.gateway.stop(options),
        this.node.stop()
      ])
    } catch (err) {
      log.error(err)
      console.log('There were errors stopping')
    }
  }
}

module.exports = HttpApi
