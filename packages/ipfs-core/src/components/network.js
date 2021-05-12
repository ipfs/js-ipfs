'use strict'

const IPFSBitswap = require('ipfs-bitswap')
const createLibP2P = require('./libp2p')
const { Multiaddr } = require('multiaddr')
const errCode = require('err-code')

/**
 * @typedef {Object} Online
 * @property {libp2p} libp2p
 * @property {Bitswap} bitswap
 *
 * @typedef {Object} Options
 * @property {PeerId} options.peerId
 * @property {Repo} options.repo
 * @property {Print} options.print
 * @property {IPFSOptions} options.options
 *
 * @typedef {import('ipfs-core-types/src/config').Config} IPFSConfig
 * @typedef {import('../types').Options} IPFSOptions
 * @typedef {import('ipfs-repo')} Repo
 * @typedef {import('../types').Print} Print
 * @typedef {import('libp2p')} libp2p
 * @typedef {import('ipfs-bitswap')} Bitswap
 * @typedef {import('peer-id')} PeerId
 * @typedef {import('ipfs-core-types/src/utils').AbortOptions} AbortOptions
 */

class Network {
  /**
   * @param {PeerId} peerId
   * @param {libp2p} libp2p
   * @param {Bitswap} bitswap
   */
  constructor (peerId, libp2p, bitswap) {
    this.peerId = peerId
    this.libp2p = libp2p
    this.bitswap = bitswap
  }

  /**
   * @param {Options} options
   */
  static async start ({ peerId, repo, print, options }) {
    // Need to ensure that repo is open as it could have been closed between
    // `init` and `start`.
    if (repo.closed) {
      await repo.open()
    }

    /** @type {IPFSConfig} */
    const config = await repo.config.getAll()

    const libp2p = await createLibP2P({
      options,
      repo,
      peerId,
      multiaddrs: readAddrs(peerId, config),
      config,
      keychainConfig: undefined
    })

    if (libp2p.keychain) {
      await libp2p.loadKeychain()
    }

    await libp2p.start()

    for (const ma of libp2p.multiaddrs) {
      print(`Swarm listening on ${ma}/p2p/${peerId.toB58String()}`)
    }

    const bitswap = new IPFSBitswap(libp2p, repo.blocks, { statsEnabled: true })
    await bitswap.start()

    return new Network(peerId, libp2p, bitswap)
  }

  /**
   * @param {Network} network
   */
  static async stop (network) {
    await Promise.all([
      network.bitswap.stop(),
      network.libp2p.stop()
    ])
  }
}
module.exports = Network

/**
 * @param {PeerId} peerId
 * @param {IPFSConfig} config
 */
const readAddrs = (peerId, config) => {
  const peerIdStr = peerId.toB58String()
  /** @type {Multiaddr[]} */
  const addrs = []
  const swarm = (config.Addresses && config.Addresses.Swarm) || []
  for (const addr of swarm) {
    let ma = new Multiaddr(addr)

    // Temporary error for users migrating using websocket-star multiaddrs for listenning on libp2p
    // websocket-star support was removed from ipfs and libp2p
    if (ma.protoCodes().includes(WEBSOCKET_STAR_PROTO_CODE)) {
      throw errCode(new Error('websocket-star swarm addresses are not supported. See https://github.com/ipfs/js-ipfs/issues/2779'), 'ERR_WEBSOCKET_STAR_SWARM_ADDR_NOT_SUPPORTED')
    }

    // multiaddrs that go via a signalling server or other intermediary (e.g. stardust,
    // webrtc-star) can have the intermediary's peer ID in the address, so append our
    // peer ID to the end of it
    const maId = ma.getPeerId()
    if (maId && maId !== peerIdStr) {
      ma = ma.encapsulate(`/p2p/${peerIdStr}`)
    }

    addrs.push(ma)
  }

  return addrs
}

const WEBSOCKET_STAR_PROTO_CODE = 479
