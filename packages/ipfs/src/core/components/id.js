'use strict'

const pkgversion = require('../../../package.json').version
const multiaddr = require('multiaddr')

module.exports = ({ peerId, libp2p }) => {
  return async function id () { // eslint-disable-line require-await
    const id = peerId.toB58String()
    let addresses = []

    if (libp2p) {
      // only available while the node is running
      addresses = libp2p.transportManager.getAddrs()
    }

    return {
      id,
      publicKey: peerId.pubKey.bytes.toString('base64'),
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
  }
}
