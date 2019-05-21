'use strict'

const OFFLINE_ERROR = require('../utils').OFFLINE_ERROR
const promisify = require('promisify-es6')
const setImmediate = require('async/setImmediate')
const Big = require('bignumber.js')
const CID = require('cids')
const PeerId = require('peer-id')
const errCode = require('err-code')

function formatWantlist (list, cidBase) {
  return Array.from(list).map((e) => ({ '/': e[1].cid.toBaseEncodedString(cidBase) }))
}

module.exports = function bitswap (self) {
  return {
    wantlist: promisify((peerId, callback) => {
      if (typeof peerId === 'function') {
        callback = peerId
        peerId = null
      }

      if (!self.isOnline()) {
        return setImmediate(() => callback(new Error(OFFLINE_ERROR)))
      }

      let list
      if (peerId) {
        try {
          peerId = PeerId.createFromB58String(peerId)
        } catch (e) {
          peerId = null
        }
        if (!peerId) {
          return setImmediate(() => callback(new Error('Invalid peerId')))
        }
        list = self._bitswap.wantlistForPeer(peerId)
      } else {
        list = self._bitswap.getWantlist()
      }

      setImmediate(() => callback(null, { Keys: formatWantlist(list) }))
    }),

    stat: promisify((callback) => {
      if (!self.isOnline()) {
        return setImmediate(() => callback(new Error(OFFLINE_ERROR)))
      }

      const snapshot = self._bitswap.stat().snapshot

      setImmediate(() => {
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
      })
    }),

    unwant: promisify((keys, callback) => {
      if (!self.isOnline()) {
        return setImmediate(() => callback(new Error(OFFLINE_ERROR)))
      }

      if (!Array.isArray(keys)) {
        keys = [keys]
      }

      try {
        keys = keys.map((key) => {
          if (CID.isCID(key)) {
            return key
          }
          return new CID(key)
        })
      } catch (err) {
        return setImmediate(() => callback(errCode(err, 'ERR_INVALID_CID')))
      }

      setImmediate(() => callback(null, self._bitswap.unwant(keys)))
    })
  }
}
