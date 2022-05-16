import { Service } from '../utils/service.js'

/**
 * @param {object} config
 * @param {import('../types').NetworkService} config.network
 * @param {import('@libp2p/interfaces/peer-id').PeerId} config.peerId
 * @param {import('ipfs-repo').IPFSRepo} config.repo
 * @param {import('../types').Print} config.print
 * @param {import('../types').Preload} config.preload
 * @param {import('../types').MfsPreload} config.mfsPreload
 * @param {import('./ipns').IPNSAPI} config.ipns
 * @param {import('@libp2p/interfaces/keychain').KeyChain} config.keychain
 * @param {import('ipfs-core-utils/multihashes').Multihashes} config.hashers
 * @param {import('../types').Options} config.options
 */
export function createStart ({ network, preload, peerId, keychain, repo, ipns, mfsPreload, print, hashers, options }) {
  /**
   * @type {import('ipfs-core-types/src/root').API<{}>["start"]}
   */
  const start = async () => {
    const { libp2p } = await Service.start(network, {
      peerId,
      repo,
      print,
      hashers,
      options
    })

    await Promise.all([
      ipns.startOnline({ keychain, libp2p, peerId, repo }),
      preload.start(),
      mfsPreload.start()
    ])
  }

  return start
}
