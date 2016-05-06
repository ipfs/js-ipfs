'use strict'

const OFFLINE_ERROR = require('../utils').OFFLINE_ERROR

module.exports = function bitswap (self) {
  return {
    wantlist: () => {
      if (!self.isOnline()) {
        throw OFFLINE_ERROR
      }

      return self._bitswap.getWantlist()
    },
    stat: () => {
      if (!self.isOnline()) {
        throw OFFLINE_ERROR
      }

      return self._bitswap.stat()
    },
    unwant: (key) => {
      if (!self.isOnline()) {
        throw OFFLINE_ERROR
      }

      // TODO: implement when https://github.com/ipfs/js-ipfs-bitswap/pull/10 is merged
    }
  }
}
