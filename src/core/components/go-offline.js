'use strict'

module.exports = (self) => {
  return (cb) => {
    self._blockService.goOffline()
    self._bitswap.stop()
    // TODO self._pubsub.stop()
    self.libp2p.stop(cb)
  }
}
