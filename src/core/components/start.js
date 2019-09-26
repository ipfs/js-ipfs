'use strict'

const Bitswap = require('ipfs-bitswap')
const callbackify = require('callbackify')

const IPNS = require('../ipns')
const routingConfig = require('../ipns/routing/config')
const createLibp2pBundle = require('./libp2p')

module.exports = (self) => {
  return callbackify(async () => {
    if (self.state.state() !== 'stopped') {
      throw new Error(`Not able to start from state: ${self.state.state()}`)
    }

    self.log('starting')
    self.state.start()

    // The repo may be closed if previously stopped
    if (self._repo.closed) {
      await self._repo.open()
    }

    const config = await self._repo.config.get()
    const libp2p = createLibp2pBundle(self, config)

    await libp2p.start()
    self.libp2p = libp2p

    const ipnsRouting = routingConfig(self)
    self._ipns = new IPNS(ipnsRouting, self._repo.datastore, self._peerInfo, self._keychain, self._options)

    self._bitswap = new Bitswap(
      self.libp2p,
      self._repo.blocks, {
        statsEnabled: true
      }
    )

    await self._bitswap.start()

    self._blockService.setExchange(self._bitswap)

    await self._preload.start()
    await self._ipns.republisher.start()
    await self._mfsPreload.start()

    self.state.started()
    self.emit('start')
  })
}
