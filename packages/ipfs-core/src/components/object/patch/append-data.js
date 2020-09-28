'use strict'

const { DAGNode } = require('ipld-dag-pb')
const { withTimeoutOption } = require('../../../utils')
const uint8ArrayConcat = require('uint8arrays/concat')

module.exports = ({ ipld, gcLock, preload }) => {
  const get = require('../get')({ ipld, preload })
  const put = require('../put')({ ipld, gcLock, preload })

  return withTimeoutOption(async function appendData (multihash, data, options) {
    const node = await get(multihash, options)
    const newData = uint8ArrayConcat([node.Data, data])
    return put(new DAGNode(newData, node.Links), options)
  })
}
