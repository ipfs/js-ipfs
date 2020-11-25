'use strict'

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

module.exports = ({ keychain }) => {
  return withTimeoutOption((name, options = {}) => {
    return keychain.createKey(name, options.type || 'rsa', options.size || 2048)
  })
}
