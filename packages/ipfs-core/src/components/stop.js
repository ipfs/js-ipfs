import { Service } from '../utils/service.js'

/**
 * @param {Object} config
 * @param {import('../types').NetworkService} config.network
 * @param {import('../types').Preload} config.preload
 * @param {import('./ipns').IPNSAPI} config.ipns
 * @param {import('ipfs-repo').IPFSRepo} config.repo
 * @param {import('../types').MfsPreload} config.mfsPreload
 */
export function createStop ({ network, preload, ipns, repo, mfsPreload }) {
  /**
   * @type {import('ipfs-core-types/src/root').API<{}>["stop"]}
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
