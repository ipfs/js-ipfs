'use strict'

const { withTimeoutOption } = require('../../utils')

module.exports = ({ keychain }) => {
  return withTimeoutOption((name, password, options = {}) => keychain.exportKey(name, password, options))
}
