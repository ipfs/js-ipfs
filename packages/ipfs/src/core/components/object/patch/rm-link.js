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
 * @returns {RmLink}
 */
module.exports = ({ ipld, gcLock, preload }) => {
  const get = require('../get')({ ipld, preload })
  const put = require('../put')({ ipld, gcLock, preload })

  /**
   * @callback RmLink
   * @param {*} multihash
   * @param {*} linkRef
   * @param {*} options
   * @returns {Promise<*>}
   *
   * @type {RmLink}
   */
  async function rmLink (multihash, linkRef, options) {
    const node = await get(multihash, options)
    node.rmLink(linkRef.Name || linkRef.name)
    return put(node, options)
  }

  return withTimeoutOption(rmLink)
}
