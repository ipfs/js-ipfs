'use strict'

const Service = require('../utils/service')

/**
 * @param {Object} config
 * @param {import('../types').NetworkService} config.network
 * @param {import('../types').Preload} config.preload
 * @param {import('../block-storage')} config.blockStorage
 * @param {import('./ipns')} config.ipns
 * @param {import('ipfs-repo')} config.repo
 * @param {import('../types').MfsPreload} config.mfsPreload
 */
module.exports = ({ network, preload, blockStorage, ipns, repo, mfsPreload }) => {
  /**
   * @type {import('ipfs-core-types/src/root').API["stop"]}
   */
  const stop = async () => {
    blockStorage.unsetExchange()
    await Promise.all([
      preload.stop(),
      ipns.stop(),
      mfsPreload.stop(),
      Service.stop(network),
      repo.close()
    ])
  }

  return stop
}
