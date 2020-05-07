'use strict'

const dagPB = require('ipld-dag-pb')
const DAGNode = dagPB.DAGNode
const DAGLink = dagPB.DAGLink
const mh = require('multihashes')
const multicodec = require('multicodec')
const { Buffer } = require('buffer')

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
    const parsed = JSON.parse(buf.toString())

    links = (parsed.Links || []).map((link) => {
      return new DAGLink(
        link.Name || link.name,
        link.Size || link.size,
        mh.fromB58String(link.Hash || link.hash || link.multihash)
      )
    })
    data = Buffer.from(parsed.Data)
  } catch (err) {
    throw new Error('failed to parse JSON: ' + err)
  }

  return new DAGNode(data, links)
}

function parseProtoBuffer (buf) {
  return dagPB.util.deserialize(buf)
}

module.exports = ({ ipld, gcLock, preload }) => {
  return async function put (obj, options) {
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
}
