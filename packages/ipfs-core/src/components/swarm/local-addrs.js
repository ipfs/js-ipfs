'use strict'

const { withTimeoutOption } = require('../../utils')

module.exports = ({ multiaddrs }) => {
  return withTimeoutOption(async function localAddrs () { // eslint-disable-line require-await
    return multiaddrs
  })
}
