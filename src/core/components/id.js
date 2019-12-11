'use strict'

const pkgversion = require('../../../package.json').version

module.exports = ({ peerInfo }) => {
  return async function id () { // eslint-disable-line require-await
    return {
      id: peerInfo.id.toB58String(),
      publicKey: peerInfo.id.pubKey.bytes.toString('base64'),
      addresses: peerInfo.multiaddrs
        .toArray()
        .map((ma) => ma.toString())
        .filter((ma) => ma.indexOf('ipfs') >= 0)
        .sort(),
      agentVersion: `js-ipfs/${pkgversion}`,
      protocolVersion: '9000'
    }
  }
}
