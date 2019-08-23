'use strict'

const series = require('async/series')
const Bitswap = require('ipfs-bitswap')
const setImmediate = require('async/setImmediate')
const promisify = require('promisify-es6')

const IPNS = require('../ipns')
const routingConfig = require('../ipns/routing/config')
const createLibp2pBundle = require('./libp2p')

module.exports = (self) => {
  return promisify(async (callback) => {
    const done = (err) => {
      if (err) {
        setImmediate(() => self.emit('error', err))
        return callback(err)
      }
debugger
      self.state.started()
      setImmediate(() => self.emit('start'))
      callback()
    }

    if (self.state.state() !== 'stopped') {
      return done(new Error(`Not able to start from state: ${self.state.state()}`))
    }

    self.log('starting')
    debugger
    self.state.start()

    // The repo may be closed if previously stopped
    if(self._repo.closed) {
      await self._repo.open()
    }
    const config = await self._repo.config.get()
    debugger
    console.log('vmx: start: config:', config)
    const libp2p = createLibp2pBundle(self, config)

    await libp2p.start()
    self.libp2p = libp2p

    const ipnsRouting = routingConfig(self)
    self._ipns = new IPNS(ipnsRouting, self._repo.datastore, self._peerInfo, self._keychain, self._options)

    self._bitswap = new Bitswap(
      self.libp2p,
      self._repo.blocks,
      { statsEnabled: true }
    )

    self._bitswap.start()
    // NOTE vmx 2019-08-22: ipfs-bitswap isn't async/awaitified yet, hence
    // do it here
    self._promisifiedBitswap = {
      get: promisify(self._bitswap.get.bind(self._bitswap)),
      getMany: promisify(self._bitswap.getMany.bind(self._bitswap)),
      put: promisify(self._bitswap.put.bind(self._bitswap)),
      putMany: promisify(self._bitswap.putMany.bind(self._bitswap)),
    }
    self._blockService.setExchange(self._promisifiedBitswap)

    self._preload.start()
    self._ipns.republisher.start()
    self._mfsPreload.start(done)
  })
}
