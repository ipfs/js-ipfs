'use strict'

module.exports = function isOnline (self) {
  /**
   * @alias isOnline
   * @memberof IPFS#
   * @method
   * @returns {boolean}
   */
  return () => {
    return self._bitswap && self._libp2pNode
  }
}
