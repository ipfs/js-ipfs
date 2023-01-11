import { logger } from '@libp2p/logger'
import { webRTCStar } from '@libp2p/webrtc-star'
import { create } from 'ipfs-core'
import { HttpApi } from 'ipfs-http-server'
import { HttpGateway } from 'ipfs-http-gateway'
import { createServer as gRPCServer } from 'ipfs-grpc-server'
import { isElectron } from 'ipfs-utils/src/env.js'
import { createLibp2p } from 'libp2p'

const log = logger('ipfs:daemon')

export class Daemon {
  /**
   * @param {import('ipfs-core').Options} options
   */
  constructor (options = {}) {
    this._options = options

    /** @type {import('ipfs-core-types').IPFS} */
    // @ts-expect-error we set this in .start()
    this._ipfs = undefined
  }

  /**
   * Starts the IPFS HTTP server
   */
  async start () {
    log('starting')

    // start the daemon
    this._ipfs = await create(
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
      // @ts-expect-error - cant find type info
      electronWebRTC = await import('electron-webrtc')()
    } catch (/** @type {any} */ err) {
      log('failed to load optional electron-webrtc dependency')
    }
  }

  if (!electronWebRTC) {
    try {
      // @ts-expect-error - cant find type info
      wrtc = (await import('wrtc')).default
    } catch (/** @type {any} */ err) {
      log('failed to load optional webrtc dependency')
    }
  }

  if (wrtc || electronWebRTC) {
    log(`Using ${wrtc ? 'wrtc' : 'electron-webrtc'} for webrtc support`)

    const transport = webRTCStar({
      wrtc: wrtc ?? electronWebRTC
    })

    libp2pOptions.transports = [...libp2pOptions.transports ?? [], transport.transport]
    libp2pOptions.peerDiscovery = [...libp2pOptions.peerDiscovery ?? [], transport.discovery]
  }

  return createLibp2p(libp2pOptions)
}
