'use strict'

const { DAGNode } = require('ipld-dag-pb')
const { withTimeoutOption } = require('../../../utils')
const { Buffer } = require('buffer')

/**
 * @typedef {Object} Context
 * @property {import('../../init').IPLD} ipld
 * @property {import('../../init').GCLock} gcLock
 * @property {import('../../init').PreloadService} preload
 */

/**
 * @param {Context} context
 * @returns {AppendData}
 */
module.exports = ({ ipld, gcLock, preload }) => {
  const get = require('../get')({ ipld, preload })
  const put = require('../put')({ ipld, gcLock, preload })

  /**
   * @callback AppendData
   * @param {*} multihash
   * @param {*} data
   * @param {*} options
   * @returns {Promise<*>}
   *
   * @type {AppendData}
   */
  async function appendData (multihash, data, options) {
    const node = await get(multihash, options)
    const newData = Buffer.concat([node.Data, data])
    return put(new DAGNode(newData, node.Links), options)
  }

  return withTimeoutOption(appendData)
}
