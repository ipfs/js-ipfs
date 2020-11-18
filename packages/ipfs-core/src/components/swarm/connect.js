'use strict'

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

module.exports = ({ libp2p }) => {
  return withTimeoutOption(function connect (addr, options) {
    return libp2p.dial(addr, options)
  })
}
