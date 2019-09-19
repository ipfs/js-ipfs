'use strict'

const callbackify = require('callbackify')

module.exports = (self) => {
  return callbackify(async () => {
    self.log('stop')

    if (self.state.state() === 'stopped') {
      throw new Error('Already stopped')
    }

    if (self.state.state() !== 'running') {
      throw new Error('Not able to stop from state: ' + self.state.state())
    }

    self.state.stop()
    self._blockService.unsetExchange()
    self._bitswap.stop()
    self._preload.stop()

    const libp2p = self.libp2p
    self.libp2p = null

    try {
      await Promise.all([
        self._ipns.republisher.stop(),
        self._mfsPreload.stop(),
        libp2p.stop(),
        self._repo.close()
      ])

      self.state.stopped()
      self.emit('stop')
    } catch (err) {
      self.emit('error', err)
      throw err
    }
  })
}
