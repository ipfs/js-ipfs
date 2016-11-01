'use strict'

module.exports = function goOffline (self) {
  return (cb) => {
    self._blockService.goOffline()
    self._bitswap.stop()
    self.libp2p.stop(cb)
  }
}
