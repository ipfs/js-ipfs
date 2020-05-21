'use strict'

const pkgversion = require('../../../package.json').version
const multiaddr = require('multiaddr')
const { withTimeoutOption } = require('../utils')

/**
 * @param {*} config
 * @returns {*}
 */
module.exports = ({ peerInfo, libp2p }) => {
  return withTimeoutOption(async function id () { // eslint-disable-line require-await
    const id = peerInfo.id.toB58String()
    /** @type {Buffer[]} */
    let addresses = []

    if (libp2p) {
      // only available while the node is running
      addresses = libp2p.transportManager.getAddrs()
    }

    return {
      id,
      publicKey: peerInfo.id.pubKey.bytes.toString('base64'),
      addresses: addresses
        .map(ma => {
          const str = ma.toString()

          // some relay-style transports add our peer id to the ma for us
          // so don't double-add
          if (str.endsWith(`/p2p/${id}`)) {
            return str
          }

          return `${str}/p2p/${id}`
        })
        .sort()
        .map(ma => multiaddr(ma)),
      agentVersion: `js-ipfs/${pkgversion}`,
      protocolVersion: '9000'
    }
  })
}
