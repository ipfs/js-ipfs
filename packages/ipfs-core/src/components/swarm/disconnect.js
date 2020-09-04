'use strict'

const { withTimeoutOption } = require('../../utils')

module.exports = ({ libp2p }) => {
  return withTimeoutOption(function disconnect (addr, options) {
    return libp2p.hangUp(addr, options)
  })
}
