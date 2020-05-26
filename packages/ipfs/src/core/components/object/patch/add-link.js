'use strict'

const { withTimeoutOption } = require('../../../utils')

/**
 * @typedef {Object} Context
 * @property {import('../../init').IPLD} ipld
 * @property {import('../../init').GCLock} gcLock
 * @property {import('../../init').PreloadService} preload
 */

/**
 * @param {Context} context
 * @returns {AddLink}
 */
module.exports = ({ ipld, gcLock, preload }) => {
  const get = require('../get')({ ipld, preload })
  const put = require('../put')({ ipld, gcLock, preload })
  /**
   * @callback AddLink
   * @param {*} multihash
   * @param {*} link
   * @param {*} options
   * @returns {Promise<*>}
   *
   * @type {AddLink}
   */
  async function addLink (multihash, link, options) {
    const node = await get(multihash, options)
    node.addLink(link)
    return put(node, options)
  }

  return withTimeoutOption(addLink)
}
