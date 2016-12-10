'use strict'

module.exports = function goOffline (self) {

  /**
   * @alias goOffline
   * @memberof IPFS#
   * @method
   * @param {function(Error)} cb
   * @returns {undefined}
   */
  return (cb) => {
    self._blockService.goOffline()
    self._bitswap.stop()
    self.libp2p.stop(cb)
  }
}
