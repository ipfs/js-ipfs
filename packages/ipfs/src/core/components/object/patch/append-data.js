'use strict'

const { DAGNode } = require('ipld-dag-pb')
const { Buffer } = require('buffer')

module.exports = ({ ipld, gcLock, preload }) => {
  const get = require('../get')({ ipld, preload })
  const put = require('../put')({ ipld, gcLock, preload })

  return async function appendData (multihash, data, options) {
    const node = await get(multihash, options)
    const newData = Buffer.concat([node.Data, data])
    return put(new DAGNode(newData, node.Links), options)
  }
}
