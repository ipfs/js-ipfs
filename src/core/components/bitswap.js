'use strict'

const OFFLINE_ERROR = require('../utils').OFFLINE_ERROR
const promisify = require('promisify-es6')
const setImmediate = require('async/setImmediate')
const Big = require('big.js')

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

    stat: promisify((callback) => {
      if (!self.isOnline()) {
        return setImmediate(() => callback(new Error(OFFLINE_ERROR)))
      }

      const snapshot = self._bitswap.stat().snapshot

      callback(null, {
        provideBufLen: parseInt(snapshot.providesBufferLength.toString()),
        blocksReceived: new Big(snapshot.blocksReceived),
        wantlist: formatWantlist(self._bitswap.getWantlist()),
        peers: self._bitswap.peers().map((id) => id.toB58String()),
        dupBlksReceived: new Big(snapshot.dupBlksReceived),
        dupDataReceived: new Big(snapshot.dupDataReceived),
        dataReceived: new Big(snapshot.dataReceived),
        blocksSent: new Big(snapshot.blocksSent),
        dataSent: new Big(snapshot.dataSent)
      })
    }),

    unwant: (key) => {
      if (!self.isOnline()) {
        throw new Error(OFFLINE_ERROR)
      }

      // TODO: implement when https://github.com/ipfs/js-ipfs-bitswap/pull/10 is merged
    }
  }
}
