'use strict'

const Service = require('../utils/service')

/**
 * @param {Object} config
 * @param {import('../types').NetworkService} config.network
 * @param {import('../types').Preload} config.preload
 * @param {import('./ipns')} config.ipns
 * @param {import('ipfs-repo').IPFSRepo} config.repo
 * @param {import('../types').MfsPreload} config.mfsPreload
 */
module.exports = ({ network, preload, ipns, repo, mfsPreload }) => {
  /**
   * @type {import('ipfs-core-types/src/root').API["stop"]}
   */
  const stop = async () => {
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
