'use strict'

const bs58 = require('bs58')

const OFFLINE_ERROR = require('../utils').OFFLINE_ERROR

function formatWantlist (list) {
  return Array.from(list).map((el) => {
    return bs58.encode(new Buffer(el[0], 'hex'))
  })
}

module.exports = function bitswap (self) {
  return {
    wantlist: () => {
      if (!self.isOnline()) {
        throw OFFLINE_ERROR
      }

      const list = self._bitswap.getWantlist()
      return formatWantlist(list)
    },
    stat: () => {
      if (!self.isOnline()) {
        throw OFFLINE_ERROR
      }

      const stats = self._bitswap.stat()
      stats.wantlist = formatWantlist(stats.wantlist)
      stats.peers = stats.peers.map((id) => id.toB58String())

      return stats
    },
    unwant: (key) => {
      if (!self.isOnline()) {
        throw OFFLINE_ERROR
      }

      // TODO: implement when https://github.com/ipfs/js-ipfs-bitswap/pull/10 is merged
    }
  }
}
