'use strict'

const pkgversion = require('../../../package.json').version
const multiaddr = require('multiaddr')

module.exports = ({ peerInfo }) => {
  return async function id () { // eslint-disable-line require-await
    const id = peerInfo.id.toB58String()

    return {
      id,
      publicKey: peerInfo.id.pubKey.bytes.toString('base64'),
      addresses: peerInfo.multiaddrs
        .toArray()
        .map(ma => `${ma}/p2p/${id}`)
        .sort()
        .map(ma => multiaddr(ma)),
      agentVersion: `js-ipfs/${pkgversion}`,
      protocolVersion: '9000'
    }
  }
}
