'use strict'

const dagPB = require('ipld-dag-pb')
const DAGNode = dagPB.DAGNode
const multicodec = require('multicodec')
const Unixfs = require('ipfs-unixfs')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('.').IPLD} config.ipld
 * @param {import('.').Preload} config.preload
 */
module.exports = ({ ipld, preload }) => {
  /**
   *
   * @param {NewOptions & AbortOptions} options
   * @returns {Promise<CID>}
   */
  async function _new (options = {}) {
    let data

    if (options.template) {
      if (options.template === 'unixfs-dir') {
        data = (new Unixfs('directory')).marshal()
      } else {
        throw new Error('unknown template')
      }
    } else {
      data = new Uint8Array(0)
    }

    const node = new DAGNode(data)

    const cid = await ipld.put(node, multicodec.DAG_PB, {
      cidVersion: 0,
      hashAlg: multicodec.SHA2_256,
      signal: options.signal
    })

    if (options.preload !== false) {
      preload(cid)
    }

    return cid
  }

  return withTimeoutOption(_new)
}

/**
 * @typedef {Object} NewOptions
 * @property {string} [template]
 * @property {boolean} [recursive]
 * @property {boolean} [nocache]
 * @property {boolean} [preload]
 * @property {string} [enc]
 *
 * @typedef {import('.').CID} CID
 * @typedef {import('.').AbortOptions} AbortOptions
 */
