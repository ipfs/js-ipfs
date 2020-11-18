'use strict'

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

module.exports = ({ ipld, gcLock, preload }) => {
  const get = require('../get')({ ipld, preload })
  const put = require('../put')({ ipld, gcLock, preload })

  return withTimeoutOption(async function rmLink (multihash, linkRef, options) {
    const node = await get(multihash, options)
    node.rmLink(linkRef.Name || linkRef.name)
    return put(node, options)
  })
}
