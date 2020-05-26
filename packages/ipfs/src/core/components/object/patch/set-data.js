'use strict'

const { DAGNode } = require('ipld-dag-pb')
const { withTimeoutOption } = require('../../../utils')

/**
 * @typedef {Object} Context
 * @property {import('../../init').IPLD} ipld
 * @property {import('../../init').GCLock} gcLock
 * @property {import('../../init').PreloadService} preload
 */

/**
 * @param {Context} context
 * @returns {SetData}
 */
module.exports = ({ ipld, gcLock, preload }) => {
  const get = require('../get')({ ipld, preload })
  const put = require('../put')({ ipld, gcLock, preload })

  /**
   * @callback SetData
   * @param {*} multihash
   * @param {*} data
   * @param {*} options
   * @returns {Promise<*>}
   *
   * @type {SetData}
   */
  async function setData (multihash, data, options) {
    const node = await get(multihash, options)
    return put(new DAGNode(data, node.Links), options)
  }

  return withTimeoutOption(setData)
}
