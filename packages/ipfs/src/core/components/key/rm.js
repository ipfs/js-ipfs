'use strict'

const { withTimeoutOption } = require('../../utils')

module.exports = ({ keychain }) => {
  return withTimeoutOption((name, options) => keychain.removeKey(name, options))
}
