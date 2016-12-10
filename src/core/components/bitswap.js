'use strict'

const OFFLINE_ERROR = require('../utils').OFFLINE_ERROR

function formatWantlist (list) {
  return Array.from(list).map((e) => e[0])
}

module.exports = function bitswap (self) {
  return {
    /**
     * @alias bitswap.wantlist
     * @memberof IPFS#
     * @method
     * @returns {Array}
     */
    wantlist: () => {
      if (!self.isOnline()) {
        throw OFFLINE_ERROR
      }

      const list = self._bitswap.getWantlist()
      return formatWantlist(list)
    },
    /**
     * @alias bitswap.stat
     * @memberof IPFS#
     * @method
     * @returns {Object}
     */
    stat: () => {
      if (!self.isOnline()) {
        throw OFFLINE_ERROR
      }

      const stats = self._bitswap.stat()
      stats.wantlist = formatWantlist(stats.wantlist)
      stats.peers = stats.peers.map((id) => id.toB58String())

      return stats
    },
    /**
     * NOT IMPLEMENTED
     * @alias bitswap.unwant
     * @memberof IPFS#
     * @method
     * @param {*} key
     * @returns {undefined}
     */
    unwant: (key) => {
      if (!self.isOnline()) {
        throw OFFLINE_ERROR
      }

      // TODO: implement when https://github.com/ipfs/js-ipfs-bitswap/pull/10 is merged
    }
  }
}
