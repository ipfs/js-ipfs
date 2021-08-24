'use strict'

const log = require('debug')('ipfs:daemon')
const set = require('just-safe-set')
// @ts-ignore - no types
const WebRTCStar = require('libp2p-webrtc-star')
const IPFS = require('ipfs-core')
const HttpApi = require('ipfs-http-server')
const HttpGateway = require('ipfs-http-gateway')
const gRPCServer = require('ipfs-grpc-server')
const { isElectron } = require('ipfs-utils/src/env')

class Daemon {
  /**
   * @param {import('ipfs-core').Options} options
   */
  constructor (options = {}) {
    this._options = options

    if (process.env.IPFS_MONITORING) {
      // Setup debug metrics collection
      const prometheusClient = require('prom-client')
      // @ts-ignore - no types
      const prometheusGcStats = require('prometheus-gc-stats')
      const collectDefaultMetrics = prometheusClient.collectDefaultMetrics
      // @ts-ignore - timeout isn't in typedefs
      collectDefaultMetrics({ timeout: 5000 })
      prometheusGcStats(prometheusClient.register)()
    }
  }

  /**
   * Starts the IPFS HTTP server
   */
  async start () {
    log('starting')

    // start the daemon
    this._ipfs = await IPFS.create(
      Object.assign({}, { start: true, libp2p: getLibp2p }, this._options)
    )

    // start HTTP servers (if API or Gateway is enabled in options)
    this._httpApi = new HttpApi(this._ipfs)
    await this._httpApi.start()

    this._httpGateway = new HttpGateway(this._ipfs)
    await this._httpGateway.start()

    const config = await this._ipfs.config.getAll()

    if (config.Addresses && config.Addresses.RPC) {
      this._grpcServer = await gRPCServer(this._ipfs)
    }

    log('started')
  }

  async stop () {
    log('stopping')

    await Promise.all([
      this._httpApi && this._httpApi.stop(),
      this._httpGateway && this._httpGateway.stop(),
      this._grpcServer && this._grpcServer.stop(),
      this._ipfs && this._ipfs.stop()
    ])

    log('stopped')
  }
}

/**
 * @type {import('ipfs-core').Libp2pFactoryFn}
 */
async function getLibp2p ({ libp2pOptions }) {
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

  const Libp2p = require('libp2p')
  return Libp2p.create(libp2pOptions)
}

module.exports = Daemon
