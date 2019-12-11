'use strict'

const Big = require('bignumber.js')

function formatWantlist (list) {
  return Array.from(list).map((e) => ({ '/': e[1].cid.toString() }))
}

module.exports = ({ bitswap }) => {
  return async function stat () { // eslint-disable-line require-await
    const snapshot = bitswap.stat().snapshot

    return {
      provideBufLen: parseInt(snapshot.providesBufferLength.toString()),
      blocksReceived: new Big(snapshot.blocksReceived),
      wantlist: formatWantlist(bitswap.getWantlist()),
      peers: bitswap.peers().map((id) => id.toB58String()),
      dupBlksReceived: new Big(snapshot.dupBlksReceived),
      dupDataReceived: new Big(snapshot.dupDataReceived),
      dataReceived: new Big(snapshot.dataReceived),
      blocksSent: new Big(snapshot.blocksSent),
      dataSent: new Big(snapshot.dataSent)
    }
  }
}
