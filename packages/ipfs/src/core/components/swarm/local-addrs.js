'use strict'

module.exports = ({ peerInfo }) => {
  return async function localAddrs () { // eslint-disable-line require-await
    return peerInfo.multiaddrs.toArray()
  }
}
