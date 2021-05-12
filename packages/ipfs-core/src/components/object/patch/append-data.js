'use strict'

const { DAGNode } = require('ipld-dag-pb')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const uint8ArrayConcat = require('uint8arrays/concat')

/**
 * @param {Object} config
 * @param {import('ipld')} config.ipld
 * @param {import('../../../types').Preload} config.preload
 * @param {import('.').GCLock} config.gcLock
 */
module.exports = ({ ipld, gcLock, preload }) => {
  const get = require('../get')({ ipld, preload })
  const put = require('../put')({ ipld, gcLock, preload })

  /**
   * @type {import('ipfs-core-types/src/object/patch').API["appendData"]}
   */
  async function appendData (multihash, data, options = {}) {
    const node = await get(multihash, options)
    const newData = uint8ArrayConcat([node.Data, data])
    return put(new DAGNode(newData, node.Links), options)
  }

  return withTimeoutOption(appendData)
}
