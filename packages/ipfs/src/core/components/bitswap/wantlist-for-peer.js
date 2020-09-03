'use strict'

const PeerId = require('peer-id')
const { withTimeoutOption } = require('../../utils')

module.exports = ({ bitswap }) => {
  return withTimeoutOption(async function wantlistForPeer (peerId, options = {}) { // eslint-disable-line require-await
    const list = bitswap.wantlistForPeer(PeerId.createFromCID(peerId), options)

    return Array.from(list).map(e => e[1].cid)
  })
}
