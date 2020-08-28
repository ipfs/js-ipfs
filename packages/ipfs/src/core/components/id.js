'use strict'

const pkgversion = require('../../../package.json').version
const multiaddr = require('multiaddr')
const { withTimeoutOption } = require('../utils')
const uint8ArrayToString = require('uint8arrays/to-string')

module.exports = ({ peerId, libp2p }) => {
  return withTimeoutOption(async function id () { // eslint-disable-line require-await
    const id = peerId.toB58String()
    let addresses = []
    let protocols = []

    if (libp2p) {
      // only available while the node is running
      addresses = libp2p.transportManager.getAddrs()
      protocols = libp2p.peerStore.protoBook.get(peerId) || []
    }

    return {
      id,
      publicKey: uint8ArrayToString(peerId.pubKey.bytes, 'base64pad'),
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
      protocolVersion: '9000',
      protocols: protocols.sort()
    }
  })
}
