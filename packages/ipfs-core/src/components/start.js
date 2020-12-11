'use strict'

const Service = require('../utils/service')

/**
 * @param {Object} config
 * @param {import('.').NetworkService} config.network
 * @param {import('.').PeerId} config.peerId
 * @param {import('.').Repo} config.repo
 * @param {import('.').BlockService} config.blockService
 * @param {import('.').Print} config.print
 * @param {import('.').Preload} config.preload
 * @param {import('.').MFSPreload} config.mfsPreload
 * @param {import('.').IPNS} config.ipns
 * @param {import('.').Keychain} config.keychain
 * @param {import('.').Options} config.options
 */
module.exports = ({ network, preload, peerId, keychain, repo, ipns, blockService, mfsPreload, print, options }) => {
  const start = async () => {
    const { bitswap, libp2p } = await Service.start(network, {
      peerId,
      repo,
      print,
      options
    })

    blockService.setExchange(bitswap)

    await Promise.all([
      ipns.startOnline({ keychain, libp2p, peerId, repo }),
      preload.start(),
      mfsPreload.start()
    ])
  }

  return start
}
