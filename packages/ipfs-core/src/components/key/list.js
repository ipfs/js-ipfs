'use strict'

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

module.exports = ({ keychain }) => {
  return withTimeoutOption((options) => keychain.listKeys(options))
}
