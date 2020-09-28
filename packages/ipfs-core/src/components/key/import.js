'use strict'

const { withTimeoutOption } = require('../../utils')

module.exports = ({ keychain }) => {
  return withTimeoutOption((name, pem, password, options) => keychain.importKey(name, pem, password, options))
}
