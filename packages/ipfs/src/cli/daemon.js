'use strict'

const log = require('debug')('ipfs:daemon')
const get = require('dlv')
const set = require('just-safe-set')
const Multiaddr = require('multiaddr')
const WebRTCStar = require('libp2p-webrtc-star')
const DelegatedPeerRouter = require('libp2p-delegated-peer-routing')
const DelegatedContentRouter = require('libp2p-delegated-content-routing')
const IPFS = require('../core')
const HttpApi = require('../http')
const createRepo = require('../core/runtime/repo-nodejs')

class Daemon {
  constructor (options) {
    this._options = options || {}

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
    log('starting')

    const repo = typeof this._options.repo === 'string' || this._options.repo == null
      ? createRepo({ path: this._options.repo, autoMigrate: this._options.repoAutoMigrate })
      : this._options.repo

    // start the daemon
    const ipfsOpts = Object.assign({}, { init: true, start: true, libp2p: getLibp2p }, this._options, { repo })
    const ipfs = this._ipfs = await IPFS.create(ipfsOpts)

    // start HTTP servers (if API or Gateway is enabled in options)
    const httpApi = new HttpApi(ipfs, ipfsOpts)
    this._httpApi = await httpApi.start()

    // for the CLI to know the where abouts of the API
    if (this._httpApi._apiServers.length) {
      await repo.apiAddr.set(this._httpApi._apiServers[0].info.ma)
    }

    log('started')
    return this
  }

  async stop () {
    log('stopping')
    await Promise.all([
      this._httpApi && this._httpApi.stop(),
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
  try {
    electronWebRTC = require('electron-webrtc')()
  } catch (err) {
    log('failed to load optional electron-webrtc dependency')
  }
  try {
    wrtc = require('wrtc')
  } catch (err) {
    log('failed to load optional webrtc dependency')
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
    const delegatedApiOptions = {
      host: delegateAddr.host,
      // port is a string atm, so we need to convert for the check
      protocol: parseInt(delegateAddr.port) === 443 ? 'https' : 'http',
      port: delegateAddr.port
    }

    libp2pOptions.modules.contentRouting = libp2pOptions.modules.contentRouting || []
    libp2pOptions.modules.contentRouting.push(new DelegatedContentRouter(peerId, delegatedApiOptions))

    libp2pOptions.modules.peerRouting = libp2pOptions.modules.peerRouting || []
    libp2pOptions.modules.peerRouting.push(new DelegatedPeerRouter(delegatedApiOptions))
  }

  const Libp2p = require('libp2p')
  return new Libp2p(libp2pOptions)
}

module.exports = Daemon
