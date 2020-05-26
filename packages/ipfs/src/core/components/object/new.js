'use strict'

const dagPB = require('ipld-dag-pb')
const DAGNode = dagPB.DAGNode
const multicodec = require('multicodec')
const Unixfs = require('ipfs-unixfs')
const { withTimeoutOption } = require('../../utils')
const { Buffer } = require('buffer')

/**
 * @typedef {import('cids')} CID
 * @typedef {import('ipld-dag-pb').DAGNode} DAGNode
 * @typedef {import('../../utils').WithTimeoutOptions} WithTimeoutOptions
 * @typedef {Object} Context
 * @property {import('../init').IPLD} ipld
 * @property {import('../init').PreloadService} preload
 *
 * @typedef {Object} NewOptions
 * @property {boolean} [recursive]
 * @property {boolean} [nocache]
 * @property {number} [cidVersion]
 * @property {boolean} [preload]
 *
 * @typedef {WithTimeoutOptions & NewOptions} Options
 */

/**
 * @param {Context} context
 * @returns {New}
 **/
module.exports = ({ ipld, preload }) => {
  /**
   * @callback New
   * @param {string|null} [template]
   * @param {Options} [options]
   * @returns {Promise<CID>}
   *
   * @type {New}
   */
  async function _new (template, options) {
    options = options || {}

    // allow options in the template position
    if (template && typeof template !== 'string') {
      options = template
      template = null
    }

    let data

    if (template) {
      if (template === 'unixfs-dir') {
        data = (new Unixfs('directory')).marshal()
      } else {
        throw new Error('unknown template')
      }
    } else {
      data = Buffer.alloc(0)
    }

    const node = new DAGNode(data)

    const cid = await ipld.put(node, multicodec.DAG_PB, {
      cidVersion: 0,
      hashAlg: multicodec.SHA2_256
    })

    if (options.preload !== false) {
      preload(cid)
    }

    return cid
  }

  return withTimeoutOption(_new)
}
