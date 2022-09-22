import { createBitswap } from 'ipfs-bitswap'
import { createLibp2p } from './libp2p.js'
import { multiaddr } from '@multiformats/multiaddr'
import errCode from 'err-code'
import { BlockStorage } from '../block-storage.js'

/**
 * @typedef {object} Online
 * @property {libp2p} libp2p
 * @property {Bitswap} bitswap
 *
 * @typedef {object} Options
 * @property {PeerId} options.peerId
 * @property {Repo} options.repo
 * @property {Print} options.print
 * @property {IPFSOptions} options.options
 * @property {import('ipfs-core-utils/multihashes').Multihashes} options.hashers
 *
 * @typedef {import('ipfs-core-types/src/config').Config} IPFSConfig
 * @typedef {import('../types').Options} IPFSOptions
 * @typedef {import('ipfs-repo').IPFSRepo} Repo
 * @typedef {import('../types').Print} Print
 * @typedef {import('libp2p').Libp2p} libp2p
 * @typedef {import('ipfs-bitswap').IPFSBitswap} Bitswap
 * @typedef {import('@libp2p/interface-peer-id').PeerId} PeerId
 * @typedef {import('ipfs-core-types/src/utils').AbortOptions} AbortOptions
 * @typedef {import('@multiformats/multiaddr').Multiaddr} Multiaddr
 */

export class Network {
  /**
   * @param {PeerId} peerId
   * @param {libp2p} libp2p
   * @param {Bitswap} bitswap
   * @param {Repo} repo
   * @param {BlockStorage} blockstore
   */
  constructor (peerId, libp2p, bitswap, repo, blockstore) {
    this.peerId = peerId
    this.libp2p = libp2p
    this.bitswap = bitswap
    this.repo = repo
    this.blockstore = blockstore
  }

  /**
   * @param {Options} options
   */
  static async start ({ peerId, repo, print, hashers, options }) {
    // Need to ensure that repo is open as it could have been closed between
    // `init` and `start`.
    if (repo.closed) {
      await repo.open()
    }

    /** @type {IPFSConfig} */
    const config = await repo.config.getAll()

    const libp2p = await createLibp2p({
      options,
      repo,
      peerId,
      multiaddrs: readAddrs(peerId, config),
      config,
      keychainConfig: undefined
    })

    await libp2p.start()

    for (const ma of libp2p.getMultiaddrs()) {
      print(`Swarm listening on ${ma.toString()}`)
    }

    const bitswap = createBitswap(libp2p, repo.blocks, {
      statsEnabled: true,
      hashLoader: hashers,
      maxInboundStreams: 1024,
      maxOutboundStreams: 1024
    })
    await bitswap.start()

    const blockstore = new BlockStorage(repo.blocks, bitswap)
    repo.blocks = blockstore
    // @ts-expect-error private field
    repo.pins.blockstore = blockstore

    return new Network(peerId, libp2p, bitswap, repo, blockstore)
  }

  /**
   * @param {Network} network
   */
  static async stop (network) {
    network.repo.blocks = network.blockstore.unwrap()
    // @ts-expect-error private field
    network.repo.pins.blockstore = network.blockstore.unwrap()

    await network.bitswap.stop()
    await network.libp2p.stop()
  }
}

/**
 * @param {PeerId} peerId
 * @param {IPFSConfig} config
 */
const readAddrs = (peerId, config) => {
  const peerIdStr = peerId.toString()
  /** @type {Multiaddr[]} */
  const addrs = []
  const swarm = (config.Addresses && config.Addresses.Swarm) || []
  for (const addr of swarm) {
    let ma = multiaddr(addr)

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
