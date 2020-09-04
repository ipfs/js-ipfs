'use strict'

const { DAGNode } = require('ipld-dag-pb')
const { withTimeoutOption } = require('../../../utils')

module.exports = ({ ipld, gcLock, preload }) => {
  const get = require('../get')({ ipld, preload })
  const put = require('../put')({ ipld, gcLock, preload })

  return withTimeoutOption(async function setData (multihash, data, options) {
    const node = await get(multihash, options)
    return put(new DAGNode(data, node.Links), options)
  })
}
