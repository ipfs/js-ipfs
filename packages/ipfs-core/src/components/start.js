'use strict'

const Service = require('../utils/service')

/**
 * @param {Object} config
 * @param {import('../types').NetworkService} config.network
 * @param {import('peer-id')} config.peerId
 * @param {import('ipfs-repo').IPFSRepo} config.repo
 * @param {import('../block-storage')} config.blockstore
 * @param {import('../types').Print} config.print
 * @param {import('../types').Preload} config.preload
 * @param {import('../types').MfsPreload} config.mfsPreload
 * @param {import('./ipns')} config.ipns
 * @param {import('libp2p/src/keychain')} config.keychain
 * @param {import('../types').Options} config.options
 */
module.exports = ({ network, preload, peerId, keychain, repo, ipns, blockstore, mfsPreload, print, options }) => {
  /**
   * @type {import('ipfs-core-types/src/root').API["start"]}
   */
  const start = async () => {
    const { bitswap, libp2p } = await Service.start(network, {
      peerId,
      repo,
      print,
      options
    })

    blockstore.setExchange(bitswap)

    await Promise.all([
      ipns.startOnline({ keychain, libp2p, peerId, repo }),
      preload.start(),
      mfsPreload.start()
    ])
  }

  return start
}
