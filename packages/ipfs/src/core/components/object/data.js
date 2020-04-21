'use strict'

const { withTimeoutOption } = require('../../utils')

module.exports = ({ ipld, preload }) => {
  const get = require('./get')({ ipld, preload })
  return withTimeoutOption(async function data (multihash, options) {
    const node = await get(multihash, options)
    return node.Data
  })
}
