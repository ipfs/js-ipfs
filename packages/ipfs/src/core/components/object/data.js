'use strict'

module.exports = ({ ipld, preload }) => {
  const get = require('./get')({ ipld, preload })
  return async function data (multihash, options) {
    const node = await get(multihash, options)
    return node.Data
  }
}
