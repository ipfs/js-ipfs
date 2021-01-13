'use strict'

const log = require('debug')('ipfs:daemon')
const get = require('dlv')
const set = require('just-safe-set')
const Multiaddr = require('multiaddr')
const WebRTCStar = require('libp2p-webrtc-star')
const DelegatedPeerRouter = require('libp2p-delegated-peer-routing')
const DelegatedContentRouter = require('libp2p-delegated-content-routing')
const ipfsHttpClient = require('ipfs-http-client')
const IPFS = require('ipfs-core')
const HttpApi = require('ipfs-http-server')
const HttpGateway = require('ipfs-http-gateway')
const gRPCServer = require('ipfs-grpc-server')
const createRepo = require('ipfs-core/src/runtime/repo-nodejs')
const { isElectron } = require('ipfs-utils/src/env')

class Daemon {
  constructor (options = {}) {
    this._options = options

    if (process.env.IPFS_MONITORING) {
      // Setup debug metrics collection
      const prometheusClient = require('prom-client')
      const prometheusGcStats = require('prometheus-gc-stats')
      const collectDefaultMetrics = prometheusClient.collectDefaultMetrics
      // @ts-ignore - timeout isn't in typedefs
      collectDefaultMetrics({ timeout: 5000 })
      prometheusGcStats(prometheusClient.register)()
    }
  }

  /**
   * Starts the IPFS HTTP server
   *
   * @returns {Promise<Daemon>} - A promise that resolves to a Daemon instance
   */
  async start () {
    log('starting')

    const repo = typeof this._options.repo === 'string' || this._options.repo == null
      ? createRepo({ path: this._options.repo, autoMigrate: this._options.repoAutoMigrate, silent: this._options.silent })
      : this._options.repo

    // start the daemon
    const ipfsOpts = Object.assign({}, { start: true, libp2p: getLibp2p }, this._options, { repo })
    const ipfs = this._ipfs = await IPFS.create(ipfsOpts)

    // start HTTP servers (if API or Gateway is enabled in options)
    const httpApi = new HttpApi(ipfs, ipfsOpts)
    this._httpApi = await httpApi.start()

    const httpGateway = new HttpGateway(ipfs, ipfsOpts)
    this._httpGateway = await httpGateway.start()

    // for the CLI to know the whereabouts of the API
    // @ts-ignore - _apiServers is possibly undefined
    if (this._httpApi._apiServers.length) {
      // @ts-ignore - _apiServers is possibly undefined
      await repo.apiAddr.set(this._httpApi._apiServers[0].info.ma)
    }

    this._grpcServer = await gRPCServer(ipfs, ipfsOpts)

    log('started')
    return this
  }

  async stop () {
    log('stopping')
    await Promise.all([
      this._httpApi && this._httpApi.stop(),
      this._httpGateway && this._httpGateway.stop(),
      this._grpcServer && this._grpcServer.stop(),
      // @ts-ignore - may not have stop if init was false
      this._ipfs && this._ipfs.stop()
    ])
    log('stopped')
    return this
  }
}

function getLibp2p ({ libp2pOptions, options, config, peerId }) {
  // Attempt to use any of the WebRTC versions available globally
  let electronWebRTC
  let wrtc

  if (isElectron) {
    try {
      // @ts-ignore - cant find type info
      electronWebRTC = require('electron-webrtc')()
    } catch (err) {
      log('failed to load optional electron-webrtc dependency')
    }
  }

  if (!electronWebRTC) {
    try {
      // @ts-ignore - cant find type info
      wrtc = require('wrtc')
    } catch (err) {
      log('failed to load optional webrtc dependency')
    }
  }

  if (wrtc || electronWebRTC) {
    log(`Using ${wrtc ? 'wrtc' : 'electron-webrtc'} for webrtc support`)
    set(libp2pOptions, 'config.transport.WebRTCStar.wrtc', wrtc || electronWebRTC)
    libp2pOptions.modules.transport.push(WebRTCStar)
  }

  // Set up Delegate Routing based on the presence of Delegates in the config
  const delegateHosts = get(options, 'config.Addresses.Delegates',
    get(config, 'Addresses.Delegates', [])
  )

  if (delegateHosts.length > 0) {
    // Pick a random delegate host
    const delegateString = delegateHosts[Math.floor(Math.random() * delegateHosts.length)]
    const delegateAddr = Multiaddr(delegateString).toOptions()
    const delegateApiOptions = {
      host: delegateAddr.host,
      // port is a string atm, so we need to convert for the check
      // @ts-ignore - parseInt(input:string) => number
      protocol: parseInt(delegateAddr.port) === 443 ? 'https' : 'http',
      port: delegateAddr.port
    }

    const delegateHttpClient = ipfsHttpClient(delegateApiOptions)

    libp2pOptions.modules.contentRouting = libp2pOptions.modules.contentRouting || []
    libp2pOptions.modules.contentRouting.push(new DelegatedContentRouter(peerId, delegateHttpClient))

    libp2pOptions.modules.peerRouting = libp2pOptions.modules.peerRouting || []
    libp2pOptions.modules.peerRouting.push(new DelegatedPeerRouter(delegateHttpClient))
  }

  const Libp2p = require('libp2p')
  return new Libp2p(libp2pOptions)
}

module.exports = Daemon
