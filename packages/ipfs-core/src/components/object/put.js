'use strict'

const dagPB = require('ipld-dag-pb')
const DAGNode = dagPB.DAGNode
const DAGLink = dagPB.DAGLink
const mh = require('multihashing-async').multihash
const multicodec = require('multicodec')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const uint8ArrayToString = require('uint8arrays/to-string')
const uint8ArrayFromString = require('uint8arrays/from-string')

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

function parseJSONBuffer (buf) {
  let data
  let links

  try {
    const parsed = JSON.parse(uint8ArrayToString(buf))

    links = (parsed.Links || []).map((link) => {
      return new DAGLink(
        link.Name || link.name,
        link.Size || link.size,
        mh.fromB58String(link.Hash || link.hash || link.multihash)
      )
    })
    data = uint8ArrayFromString(parsed.Data)
  } catch (err) {
    throw new Error('failed to parse JSON: ' + err)
  }

  return new DAGNode(data, links)
}

function parseProtoBuffer (buf) {
  return dagPB.util.deserialize(buf)
}

/**
 * @param {Object} config
 * @param {import('.').IPLD} config.ipld
 * @param {import('.').Preload} config.preload
 * @param {import('.').GCLock} config.gcLock
 */
module.exports = ({ ipld, gcLock, preload }) => {
  /**
   *
   * @param {Uint8Array|DAGNode|{ Data: any, links: DAGLink[]}} obj
   * @param {PutOptions & AbortOptions} options
   * @returns {Promise<CID>}
   */
  async function put (obj, options = {}) {
    const encoding = options.enc
    let node

    if (obj instanceof Uint8Array) {
      if (encoding) {
        node = await parseBuffer(obj, encoding)
      } else {
        node = new DAGNode(obj)
      }
    } else if (DAGNode.isDAGNode(obj)) {
      // already a dag node
      node = obj
    } else if (typeof obj === 'object') {
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

/**
 * @typedef {Object} PutOptions
 * @property {boolean} [preload]
 * @property {string} [enc]
 *
 * @typedef {import('.').CID} CID
 * @typedef {import('.').AbortOptions} AbortOptions
 */
