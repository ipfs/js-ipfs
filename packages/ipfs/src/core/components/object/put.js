'use strict'

const dagPB = require('ipld-dag-pb')
const DAGNode = dagPB.DAGNode
const DAGLink = dagPB.DAGLink
const mh = require('multihashes')
const multicodec = require('multicodec')
const { withTimeoutOption } = require('../../utils')
const { Buffer } = require('buffer')

/**
 * @param {Buffer} buf
 * @param {string} encoding
 * @returns {*}
 */
function parseBuffer (buf, encoding) {
  switch (encoding) {
    case 'json':
      return parseJSONBuffer(buf)
    case 'protobuf':
      return parseProtoBuffer(buf)
    default:
      throw new Error(`unkown encoding: ${encoding}`)
  }
}

/**
 * @param {Buffer} buf
 * @returns {DAGNode}
 */
function parseJSONBuffer (buf) {
  let data
  let links

  try {
    const parsed = JSON.parse(buf.toString())

    // @ts-ignore
    links = (parsed.Links || []).map((link) => {
      return new DAGLink(
        link.Name || link.name,
        link.Size || link.size,
        // @ts-ignore
        mh.fromB58String(link.Hash || link.hash || link.multihash)
      )
    })
    data = Buffer.from(parsed.Data)
  } catch (err) {
    throw new Error('failed to parse JSON: ' + err)
  }

  return new DAGNode(data, links)
}

/**
 * @param {Buffer} buf
 * @returns {*}
 */
function parseProtoBuffer (buf) {
  return dagPB.util.deserialize(buf)
}

/**
 * @typedef {import('cids')} CID
 * @typedef {import('ipld-dag-pb').DAGNode} DAGNode
 * @typedef {import('../../utils').WithTimeoutOptions} WithTimeoutOptions
 * @typedef {Object} Context
 * @property {import('../init').IPLD} ipld
 * @property {import('../init').PreloadService} preload
 * @property {import('../init').GCLock} gcLock
 *
 * @typedef {Object} PutOptions
 * @property {string} [enc]
 *
 * @typedef {WithTimeoutOptions & PutOptions} Options
 *
 * @typedef {Object} InputNode
 * @property {Buffer} Data
 * @property {DAGLink[]} Links
 */

/**
 * @param {Context} context
 * @returns {Put}
 **/
module.exports = ({ ipld, gcLock, preload }) => {
  /**
   * @callback Put
   * Store a MerkleDAG node.
   * @param {DAGNode|Buffer|InputNode} obj
   * @param {*} options
   * @type {Put}
   */
  async function put (obj, options) {
    options = options || {}

    const encoding = options.enc
    let node

    if (Buffer.isBuffer(obj)) {
      if (encoding) {
        node = await parseBuffer(obj, encoding)
      } else {
        node = new DAGNode(obj)
      }
    } else if (DAGNode.isDAGNode(obj)) {
      // already a dag node
      node = obj
    } else if (typeof obj === 'object') {
      // @ts-ignore - DAGNode API is unknown
      node = new DAGNode(obj.Data, obj.Links)
    } else {
      throw new Error('obj not recognized')
    }

    const release = await gcLock.readLock()

    try {
      const cid = await ipld.put(node, multicodec.DAG_PB, {
        cidVersion: 0,
        hashAlg: multicodec.SHA2_256
      })

      if (options.preload !== false) {
        preload(cid)
      }

      return cid
    } finally {
      release()
    }
  }

  return withTimeoutOption(put)
}
