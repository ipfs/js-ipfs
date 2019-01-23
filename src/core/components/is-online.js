'use strict'

module.exports = function isOnline (self) {
  return () => {
    return Boolean(self._bitswap && self.libp2p && self.libp2p.isStarted())
  }
}
