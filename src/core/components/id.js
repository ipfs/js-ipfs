'use strict'

const promisify = require('promisify-es6')

module.exports = function id (self) {
  /**
   * @alias id
   * @memberof IPFS#
   * @method
   * @method
   * @param {Object} [opts={}]
   * @param {function(Error, IPFS#Id)} callback
   * @returns {Promise<IPFS#Id>|undefined}
   *
   * @see https://github.com/ipfs/interface-ipfs-core/tree/master/API/generic#id
   */
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

/**
 * @typedef {object} Id
 * @memberof IPFS#
 * @param {string} id - encoded in `base58`
 * @param {string} publicKey - encoded in `base64`
 * @param {Array<string>} addresses
 * @param {string} agentVersion
 * @param {string} protocolVersion
 */
