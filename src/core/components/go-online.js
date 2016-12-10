'use strict'

const series = require('async/series')
const Bitswap = require('ipfs-bitswap')

module.exports = function goOnline (self) {
  /**
   * @alias goOnline
   * @memberof IPFS#
   * @method
   * @param {function(Error)} cb
   * @returns {undefined}
   */
  return (cb) => {
    series([
      self.load,
      self.libp2p.start
    ], (err) => {
      if (err) {
        return cb(err)
      }

      self._bitswap = new Bitswap(
        self._libp2pNode.peerInfo,
        self._libp2pNode,
        self._repo.blockstore,
        self._libp2pNode.peerBook
      )
      self._bitswap.start()
      self._blockService.goOnline(self._bitswap)
      cb()
    })
  }
}
