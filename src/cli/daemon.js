'use strict'

const debug = require('debug')

const IPFS = require('../core')
const HttpApi = require('../http')
const WStar = require('libp2p-webrtc-star')
const TCP = require('libp2p-tcp')
const MulticastDNS = require('libp2p-mdns')
const WS = require('libp2p-websockets')
const Bootstrap = require('libp2p-bootstrap')

class Daemon {
  constructor (options) {
    this._options = options || {}
    this._log = debug('ipfs:daemon')
    this._log.error = debug('ipfs:daemon:error')

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

    const libp2p = { modules: {}, config: {} }

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
    const ipfsOpts = Object.assign({ }, { init: true, start: true, libp2p }, this._options)
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

    // start HTTP servers (if API or Gateway is enabled in options)
    const httpApi = new HttpApi(ipfs, ipfsOpts)
    this._httpApi = await httpApi.start()

    // for the CLI to know the where abouts of the API
    if (this._httpApi._apiServers.length) {
      await ipfs._repo.apiAddr.set(this._httpApi._apiServers[0].info.ma)
    }

    this._log('started')
    return this
  }

  async stop () {
    this._log('stopping')
    await Promise.all([
      this._httpApi && this._httpApi.stop(),
      this._ipfs && this._ipfs.stop()
    ])
    this._log('stopped')
    return this
  }
}

module.exports = Daemon
