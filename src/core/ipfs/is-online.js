'use strict'

module.exports = function isOnline (self) {
  return () => {
    return self._bitswap && self._libp2pNode
  }
}
