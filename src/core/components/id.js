'use strict'

const callbackify = require('callbackify')
const pkgversion = require('../../../package.json').version

module.exports = function id (self) {
  return callbackify(async () => { // eslint-disable-line require-await
    return {
      id: self._peerInfo.id.toB58String(),
      publicKey: self._peerInfo.id.pubKey.bytes.toString('base64'),
      addresses: self._peerInfo.multiaddrs
        .toArray()
        .map((ma) => ma.toString())
        .filter((ma) => ma.indexOf('ipfs') >= 0)
        .sort(),
      agentVersion: `js-ipfs/${pkgversion}`,
      protocolVersion: '9000'
    }
  })
}
