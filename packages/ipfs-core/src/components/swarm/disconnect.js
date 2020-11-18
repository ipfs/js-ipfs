'use strict'

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

module.exports = ({ libp2p }) => {
  return withTimeoutOption(function disconnect (addr, options) {
    return libp2p.hangUp(addr, options)
  })
}
