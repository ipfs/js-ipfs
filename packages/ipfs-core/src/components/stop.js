'use strict'

const Service = require('../utils/service')

/**
 * @param {Object} config
 * @param {import('.').NetworkService} config.network
 * @param {import('.').Preload} config.preload
 * @param {import('.').BlockService} config.blockService
 * @param {import('.').IPNS} config.ipns
 * @param {import('.').Repo} config.repo
 * @param {import('.').MFSPreload} config.mfsPreload
 */
module.exports = ({ network, preload, blockService, ipns, repo, mfsPreload }) => {
  const stop = async () => {
    blockService.unsetExchange()
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
