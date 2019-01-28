'use strict'

const Hapi = require('hapi')
const Pino = require('hapi-pino')
const debug = require('debug')
const multiaddr = require('multiaddr')
const promisify = require('promisify-es6')

const IPFS = require('../core')
const WStar = require('libp2p-webrtc-star')
const TCP = require('libp2p-tcp')
const MulticastDNS = require('libp2p-mdns')
const WS = require('libp2p-websockets')
const Bootstrap = require('libp2p-bootstrap')
const errorHandler = require('./error-handler')

function uriToMultiaddr (uri) {
  const ipPort = uri.split('/')[2].split(':')
  return `/ip4/${ipPort[0]}/tcp/${ipPort[1]}`
}

class HttpApi {
  constructor (options) {
    this._options = options || {}
    this._log = debug('jsipfs:http-api')
    this._log.error = debug('jsipfs:http-api:error')

    if (process.env.IPFS_MONITORING) {
      // Setup debug metrics collection
      const prometheusClient = require('prom-client')
      const prometheusGcStats = require('prometheus-gc-stats')
      const collectDefaultMetrics = prometheusClient.collectDefaultMetrics
      collectDefaultMetrics({ timeout: 5000 })
      prometheusGcStats(prometheusClient.register)()
    }
  }

  async start () {
    this._log('starting')

    const libp2p = { modules: {} }

    // Attempt to use any of the WebRTC versions available globally
    let electronWebRTC
    let wrtc
    try {
      electronWebRTC = require('electron-webrtc')()
    } catch (err) {
      this._log('failed to load optional electron-webrtc dependency')
    }
    try {
      wrtc = require('wrtc')
    } catch (err) {
      this._log('failed to load optional webrtc dependency')
    }

    if (wrtc || electronWebRTC) {
      const using = wrtc ? 'wrtc' : 'electron-webrtc'
      this._log(`Using ${using} for webrtc support`)
      const wstar = new WStar({ wrtc: (wrtc || electronWebRTC) })
      libp2p.modules.transport = [TCP, WS, wstar]
      libp2p.modules.peerDiscovery = [MulticastDNS, Bootstrap, wstar.discovery]
    }

    // start the daemon
    const ipfsOpts = Object.assign({ init: false }, this._options, { start: true, libp2p })
    const ipfs = new IPFS(ipfsOpts)

    await new Promise((resolve, reject) => {
      ipfs.once('error', err => {
        this._log('error starting core', err)
        err.code = 'ENOENT'
        reject(err)
      })
      ipfs.once('start', resolve)
    })

    this._ipfs = ipfs

    const config = await ipfs.config.get()

    const apiAddr = config.Addresses.API.split('/')
    const apiServer = await this._createApiServer(apiAddr[2], apiAddr[4], ipfs)
    await apiServer.start()
    apiServer.info.ma = uriToMultiaddr(apiServer.info.uri)
    this._apiServer = apiServer

    // for the CLI to know the where abouts of the API
    await promisify(ipfs._repo.apiAddr.set)(apiServer.info.ma)

    const gatewayAddr = config.Addresses.Gateway.split('/')
    const gatewayServer = await this._createGatewayServer(gatewayAddr[2], gatewayAddr[4], ipfs)
    await gatewayServer.start()
    gatewayServer.info.ma = uriToMultiaddr(gatewayServer.info.uri)
    this._gatewayServer = gatewayServer

    ipfs._print('API listening on %s', apiServer.info.ma)
    ipfs._print('Gateway (read only) listening on %s', gatewayServer.info.ma)
    ipfs._print('Web UI available at %s', apiServer.info.uri + '/webui')
    this._log('started')
    return this
  }

  async _createApiServer (host, port, ipfs) {
    const server = Hapi.server({
      host,
      port,
      // CORS is enabled by default
      // TODO: shouldn't, fix this
      routes: {
        cors: true
      }
    })
    server.app.ipfs = ipfs

    await server.register({
      plugin: Pino,
      options: {
        prettyPrint: process.env.NODE_ENV !== 'production',
        logEvents: ['onPostStart', 'onPostStop', 'response', 'request-error'],
        level: process.env.DEBUG ? 'debug' : 'error'
      }
    })

    const setHeader = (key, value) => {
      server.ext('onPreResponse', (request, h) => {
        const { response } = request
        if (response.isBoom) {
          response.output.headers[key] = value
        } else {
          response.header(key, value)
        }
        return h.continue
      })
    }

    // Set default headers
    setHeader('Access-Control-Allow-Headers',
      'X-Stream-Output, X-Chunked-Output, X-Content-Length')
    setHeader('Access-Control-Expose-Headers',
      'X-Stream-Output, X-Chunked-Output, X-Content-Length')

    server.route(require('./api/routes'))

    errorHandler(server)

    return server
  }

  async _createGatewayServer (host, port, ipfs) {
    const server = Hapi.server({ host, port })
    server.app.ipfs = ipfs

    await server.register({
      plugin: Pino,
      options: {
        prettyPrint: Boolean(process.env.DEBUG),
        logEvents: ['onPostStart', 'onPostStop', 'response', 'request-error'],
        level: process.env.DEBUG ? 'debug' : 'error'
      }
    })

    server.route(require('./gateway/routes'))

    return server
  }

  get apiAddr () {
    if (!this._apiServer) throw new Error('API address unavailable - server is not started')
    return multiaddr('/ip4/127.0.0.1/tcp/' + this._apiServer.info.port)
  }

  async stop () {
    this._log('stopping')
    await Promise.all([
      this._apiServer && this._apiServer.stop(),
      this._gatewayServer && this._gatewayServer.stop(),
      this._ipfs && this._ipfs.stop()
    ])
    this._log('stopped')
    return this
  }
}

module.exports = HttpApi
