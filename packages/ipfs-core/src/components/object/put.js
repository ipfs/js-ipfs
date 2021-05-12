'use strict'

const {
  DAGNode,
  DAGLink,
  util: DAGLinkUtil
} = require('ipld-dag-pb')
const mh = require('multihashing-async').multihash
const multicodec = require('multicodec')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const uint8ArrayToString = require('uint8arrays/to-string')
const uint8ArrayFromString = require('uint8arrays/from-string')

/**
 * @param {Uint8Array} buf
 * @param {import('ipfs-core-types/src/object').PutEncoding} encoding
 */
function parseBuffer (buf, encoding) {
  switch (encoding) {
    case 'json':
      return parseJSONBuffer(buf)
    case 'protobuf':
      return parseProtoBuffer(buf)
    default:
      throw new Error(`unknown encoding: ${encoding}`)
  }
}

/**
 * @param {Uint8Array} buf
 */
function parseJSONBuffer (buf) {
  let data
  let links

  try {
    const parsed = JSON.parse(uint8ArrayToString(buf))

    // @ts-ignore - loose input types
    links = (parsed.Links || []).map((link) => {
      return new DAGLink(
        // @ts-ignore - loose input types
        link.Name || link.name,
        // @ts-ignore - loose input types
        link.Size || link.size,
        // @ts-ignore - loose input types
        mh.fromB58String(link.Hash || link.hash || link.multihash)
      )
    })

    // @ts-ignore - loose input types
    data = uint8ArrayFromString(parsed.Data)
  } catch (err) {
    throw new Error('failed to parse JSON: ' + err)
  }

  return new DAGNode(data, links)
}

/**
 * @param {Uint8Array} buf
 */
function parseProtoBuffer (buf) {
  return DAGLinkUtil.deserialize(buf)
}

/**
 * @param {Object} config
 * @param {import('ipld')} config.ipld
 * @param {import('../../types').Preload} config.preload
 * @param {import('.').GCLock} config.gcLock
 */
module.exports = ({ ipld, gcLock, preload }) => {
  /**
   * @type {import('ipfs-core-types/src/object').API["put"]}
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
    } else if (obj instanceof DAGNode) {
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
        hashAlg: mh.names['sha2-256']
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
