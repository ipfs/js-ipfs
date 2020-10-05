'use strict'

const { withTimeoutOption } = require('../../utils')

module.exports = ({ libp2p }) => {
  return withTimeoutOption(function connect (addr, options) {
    return libp2p.dial(addr, options)
  })
}
