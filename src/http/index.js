'use strict'

const Hapi = require('hapi')
const Pino = require('hapi-pino')
const debug = require('debug')
const multiaddr = require('multiaddr')
const promisify = require('promisify-es6')
const toUri = require('multiaddr-to-uri')
const toMultiaddr = require('uri-to-multiaddr')

const IPFS = require('../core')
const WStar = require('libp2p-webrtc-star')
const TCP = require('libp2p-tcp')
const MulticastDNS = require('libp2p-mdns')
const WS = require('libp2p-websockets')
const Bootstrap = require('libp2p-bootstrap')
const errorHandler = require('./error-handler')

function hapiInfoToMultiaddr (info) {
  let hostname = info.host
  let uri = info.uri
  // ipv6 fix
  if (hostname.includes(':') && !hostname.startsWith('[')) {
    // hapi 16 produces invalid URI for ipv6
    // we fix it here by restoring missing square brackets
    hostname = `[${hostname}]`
    uri = uri.replace(`://${info.host}`, `://${hostname}`)
  }
  return toMultiaddr(uri)
}

async function serverCreator (serverAddrsArr, createServerFunc, hapiInfoToMultiaddr, ipfs) {
  if (!serverAddrsArr.length) {
    throw Error('There are no addresses')
  }
  const processServer = async (serverInstance, createServerFunc, hapiInfoToMultiaddr, ipfs) => {
    let addr = serverInstance.split('/')
    let _Server = await createServerFunc(addr[2], addr[4], ipfs)
    await _Server.start()
    _Server.info.ma = hapiInfoToMultiaddr(_Server.info)
    return _Server
  }
  return Promise.all(
    serverAddrsArr.map(server => processServer(server, createServerFunc, hapiInfoToMultiaddr))
  )
}

async function resolvePromise (promise) {
  const data = await Promise.resolve(promise)
  return data
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

    const apiAddrs = config.Addresses.API

    this._apiServers = serverCreator.apply(this, [apiAddrs, this._createApiServer, hapiInfoToMultiaddr, ipfs])
    let apiServerInfo = await Promise.resolve(this._apiServers)
    // for the CLI to know the where abouts of the API
    await promisify(ipfs._repo.apiAddr.set)(apiServerInfo)

    const gatewayAddr = config.Addresses.Gateway
    this._gatewayServer = serverCreator.apply(this, [gatewayAddr, this._createGatewayServer, hapiInfoToMultiaddr, ipfs])
    let gatewayServerInfo = await Promise.resolve(this._gatewayServer)
    apiServerInfo.forEach(apiServer => {
      ipfs._print('API listening on %s', apiServer.info.ma)
    })
    gatewayServerInfo.forEach(gatewayServer => {
      ipfs._print('Gateway (read only) listening on %s', gatewayServer.info.ma)
    })
    apiServerInfo.forEach(apiServer => {
      ipfs._print('Web UI available at %s', toUri(apiServer.info.ma + '/webui'))
    })
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
    let apiAddress = resolvePromise(this._apiServer)
    return apiAddress.map(apiAddress => multiaddr('/ip4/127.0.0.1/tcp/' + apiAddress.info.port))
  }

  async stop () {
    function stopServer (serverArr) {
      for (let i = 0; i < serverArr.length; i++) {
        serverArr[i].stop()
      }
    }
    this._log('stopping')
    await Promise.all([
      this._apiServer && stopServer(this._apiServer),
      this._gatewayServer && stopServer(this._gatewayServer),
      this._ipfs && this._ipfs.stop()
    ])
    this._log('stopped')
    return this
  }
}

module.exports = HttpApi
