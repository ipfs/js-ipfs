'use strict'

const { withTimeoutOption } = require('../../utils')

module.exports = ({ keychain }) => {
  return withTimeoutOption((options) => keychain.listKeys(options))
}
