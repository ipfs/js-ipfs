'use strict'

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

module.exports = ({ multiaddrs }) => {
  return withTimeoutOption(async function localAddrs () { // eslint-disable-line require-await
    return multiaddrs
  })
}
