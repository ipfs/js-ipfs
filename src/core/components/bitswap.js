'use strict'

const OFFLINE_ERROR = require('../utils').OFFLINE_ERROR

function formatWantlist (list) {
  return Array.from(list).map((e) => e[1])
}

module.exports = function bitswap (self) {
  return {
    wantlist: () => {
      if (!self.isOnline()) {
        throw new Error(OFFLINE_ERROR)
      }

      const list = self._bitswap.getWantlist()
      return formatWantlist(list)
    },
    stat: () => {
      if (!self.isOnline()) {
        throw new Error(OFFLINE_ERROR)
      }

      return Object.assign({}, self._bitswap.stat().snapshot, {
        wantlist: formatWantlist(self._bitswap.getWantlist()),
        peers: self._bitswap.peers().map((id) => id.toB58String())
      })
    },
    unwant: (key) => {
      if (!self.isOnline()) {
        throw new Error(OFFLINE_ERROR)
      }

      // TODO: implement when https://github.com/ipfs/js-ipfs-bitswap/pull/10 is merged
    }
  }
}
