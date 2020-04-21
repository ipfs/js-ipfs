'use strict'

const { withTimeoutOption } = require('../../utils')

module.exports = ({ peerInfo }) => {
  return withTimeoutOption(async function localAddrs () { // eslint-disable-line require-await
    return peerInfo.multiaddrs.toArray()
  })
}
