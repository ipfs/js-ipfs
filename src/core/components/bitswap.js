'use strict'

const OFFLINE_ERROR = require('../utils').OFFLINE_ERROR
const prettyBytes = require('pretty-bytes')
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

    stat: callbackify(async (options = {}) => { // eslint-disable-line require-await
      if (!self.isOnline()) {
        throw new Error(OFFLINE_ERROR)
      }

      const { human } = options
      const {
        providesBufferLength,
        blocksReceived,
        dupBlksReceived,
        dupDataReceived,
        dataReceived,
        blocksSent,
        dataSent
      } = self._bitswap.stat().snapshot

      return {
        provideBufLen: human
          ? providesBufferLength.toNumber()
          : providesBufferLength,
        blocksReceived: human
          ? blocksReceived.toNumber()
          : blocksReceived,
        wantlist: human
          ? `[${Array.from(self._bitswap.getWantlist()).length} keys]`
          : formatWantlist(self._bitswap.getWantlist()),
        peers: human
          ? `[${self._bitswap.peers().length}]`
          : self._bitswap.peers().map((id) => id.toB58String()),
        dupBlksReceived: human
          ? dupBlksReceived.toNumber()
          : dupBlksReceived,
        dupDataReceived: human
          ? prettyBytes(dupDataReceived.toNumber()).toUpperCase()
          : dupDataReceived,
        dataReceived: human
          ? prettyBytes(dataReceived.toNumber()).toUpperCase()
          : dataReceived,
        blocksSent: human
          ? blocksSent.toNumber()
          : blocksSent,
        dataSent: human
          ? prettyBytes(dataSent.toNumber()).toUpperCase()
          : dataSent
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
