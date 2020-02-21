'use strict'

module.exports = ({ ipld, gcLock, preload }) => {
  const get = require('../get')({ ipld, preload })
  const put = require('../put')({ ipld, gcLock, preload })

  return async function addLink (multihash, link, options) {
    const node = await get(multihash, options)
    node.addLink(link)
    return put(node, options)
  }
}
