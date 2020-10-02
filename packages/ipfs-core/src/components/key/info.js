'use strict'

const { withTimeoutOption } = require('../../utils')

module.exports = ({ keychain }) => {
  return withTimeoutOption((name, options) => keychain.findKeyByName(name, options))
}
