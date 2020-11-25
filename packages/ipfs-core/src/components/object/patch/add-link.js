'use strict'

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

module.exports = ({ ipld, gcLock, preload }) => {
  const get = require('../get')({ ipld, preload })
  const put = require('../put')({ ipld, gcLock, preload })

  return withTimeoutOption(async function addLink (multihash, link, options) {
    const node = await get(multihash, options)
    node.addLink(link)
    return put(node, options)
  })
}
