'use strict'

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

module.exports = ({ keychain }) => {
  return withTimeoutOption((name, pem, password, options) => keychain.importKey(name, pem, password, options))
}
