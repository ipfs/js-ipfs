'use strict'

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

module.exports = ({ ipld, preload }) => {
  const get = require('./get')({ ipld, preload })
  return withTimeoutOption(async function data (multihash, options) {
    const node = await get(multihash, options)
    return node.Data
  })
}
