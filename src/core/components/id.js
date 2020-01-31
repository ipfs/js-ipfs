'use strict'

const pkgversion = require('../../../package.json').version

module.exports = ({ peerInfo }) => {
  return async function id () { // eslint-disable-line require-await
    const id = peerInfo.id.toB58String()

    return {
      id,
      publicKey: peerInfo.id.pubKey.bytes.toString('base64'),
      addresses: peerInfo.multiaddrs
        .toArray()
        .map(ma => {
          const str = ma.toString()

          // some relay-style transports add our peer id to the ma for us
          // so don't double-add
          if (str.endsWith(`/p2p/${id}`)) {
            return str
          }

          return `${str}/p2p/${id}`
        })
        .sort(),
      agentVersion: `js-ipfs/${pkgversion}`,
      protocolVersion: '9000'
    }
  }
}
