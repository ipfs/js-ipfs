'use strict'

const { withTimeoutOption } = require('../../utils')

module.exports = ({ keychain }) => {
  return withTimeoutOption((name, options) => {
    options = options || {}
    return keychain.createKey(name, options.type || 'rsa', options.size || 2048)
  })
}
