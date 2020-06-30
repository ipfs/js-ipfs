'use strict'

const PeerId = require('peer-id')
const CID = require('cids')
const { withTimeoutOption } = require('../../utils')

module.exports = ({ bitswap }) => {
  return withTimeoutOption(async function wantlist (peerId, options = {}) { // eslint-disable-line require-await
    if (peerId && !CID.isCID(peerId) && typeof peerId !== 'string' && !Buffer.isBuffer(peerId) && !PeerId.isPeerId(peerId)) {
      options = peerId
      peerId = null
    }

    const list = peerId
      ? bitswap.wantlistForPeer(PeerId.createFromCID(peerId))
      : bitswap.getWantlist(options)

    return Array.from(list).map(e => e[1].cid)
  })
}
