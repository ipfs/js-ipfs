'use strict'

const PeerId = require('peer-id')

function formatWantlist (list) {
  return Array.from(list).map((e) => ({ '/': e[1].cid.toString() }))
}

module.exports = ({ bitswap }) => {
  return async function wantlist (peerId) { // eslint-disable-line require-await
    const list = peerId
      ? bitswap.wantlistForPeer(PeerId.createFromCID(peerId))
      : bitswap.getWantlist()

    return { Keys: formatWantlist(list) }
  }
}
