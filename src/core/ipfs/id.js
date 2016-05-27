'use strict'

module.exports = function id (self) {
  return (opts, callback) => {
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
        ID: self._peerInfo.id.toB58String(),
        PublicKey: self._peerInfo.id.pubKey.bytes.toString('base64'),
        Addresses: self._peerInfo.multiaddrs.map((ma) => { return ma.toString() }).sort(),
        AgentVersion: 'js-ipfs',
        ProtocolVersion: '9000'
      })
    }
  }
}
