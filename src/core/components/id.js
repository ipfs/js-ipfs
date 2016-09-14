'use strict'

const promisify = require('promisify-es6')

module.exports = function id (self) {
  return promisify((opts, callback) => {
    if (typeof opts === 'function') {
      callback = opts
      opts = {}
    }
    if (!self._peerInfo) { // because of split second warmup
      setTimeout(ready, 100)
    } else {
      ready()
    }

    function ready () {
      callback(null, {
        id: self._peerInfo.id.toB58String(),
        publicKey: self._peerInfo.id.pubKey.bytes.toString('base64'),
        addresses: self._peerInfo.multiaddrs.map((ma) => {
          const addr = ma.toString() + '/ipfs/' + self._peerInfo.id.toB58String()
          return addr
        }).sort(),
        agentVersion: 'js-ipfs',
        protocolVersion: '9000'
      })
    }
  })
}
