'use strict'

const OFFLINE_ERROR = require('../utils').OFFLINE_ERROR
const callbackify = require('callbackify')
const Big = require('bignumber.js')
const CID = require('cids')
const PeerId = require('peer-id')
const errCode = require('err-code')

function formatWantlist (list, cidBase) {
  return Array.from(list).map((e) => ({ '/': e[1].cid.toBaseEncodedString(cidBase) }))
}

module.exports = function bitswap (self) {
  return {
    wantlist: callbackify.variadic(async (peerId) => { // eslint-disable-line require-await
      if (!self.isOnline()) {
        throw new Error(OFFLINE_ERROR)
      }

      let list

      if (peerId) {
        peerId = PeerId.createFromB58String(peerId)

        list = self._bitswap.wantlistForPeer(peerId)
      } else {
        list = self._bitswap.getWantlist()
      }

      return { Keys: formatWantlist(list) }
    }),

    stat: callbackify(async () => { // eslint-disable-line require-await
      if (!self.isOnline()) {
        throw new Error(OFFLINE_ERROR)
      }

      const snapshot = self._bitswap.stat().snapshot

      return {
        provideBufLen: parseInt(snapshot.providesBufferLength.toString()),
        blocksReceived: new Big(snapshot.blocksReceived),
        wantlist: formatWantlist(self._bitswap.getWantlist()),
        peers: self._bitswap.peers().map((id) => id.toB58String()),
        dupBlksReceived: new Big(snapshot.dupBlksReceived),
        dupDataReceived: new Big(snapshot.dupDataReceived),
        dataReceived: new Big(snapshot.dataReceived),
        blocksSent: new Big(snapshot.blocksSent),
        dataSent: new Big(snapshot.dataSent)
      }
    }),

    unwant: callbackify(async (keys) => { // eslint-disable-line require-await
      if (!self.isOnline()) {
        throw new Error(OFFLINE_ERROR)
      }

      if (!Array.isArray(keys)) {
        keys = [keys]
      }

      try {
        keys = keys.map((key) => new CID(key))
      } catch (err) {
        throw errCode(err, 'ERR_INVALID_CID')
      }

      return self._bitswap.unwant(keys)
    })
  }
}
