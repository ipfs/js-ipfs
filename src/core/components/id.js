'use strict'

const promisify = require('promisify-es6')
const mafmt = require('mafmt')

module.exports = function id (self) {
  return promisify((opts, callback) => {
    if (typeof opts === 'function') {
      callback = opts
      opts = {}
    }

    setImmediate(() => callback(null, {
      id: self._peerInfo.id.toB58String(),
      publicKey: self._peerInfo.id.pubKey.bytes.toString('base64'),
      addresses: self._peerInfo.multiaddrs.map((ma) => {
        if (mafmt.IPFS.matches(ma)) {
          return ma.toString()
        } else {
          return ma.toString() + '/ipfs/' + self._peerInfo.id.toB58String()
        }
      }).sort(),
      agentVersion: 'js-ipfs',
      protocolVersion: '9000'
    }))
  })
}
