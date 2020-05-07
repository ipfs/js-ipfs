'use strict'

const dagPB = require('ipld-dag-pb')
const DAGNode = dagPB.DAGNode
const multicodec = require('multicodec')
const Unixfs = require('ipfs-unixfs')
const { Buffer } = require('buffer')

module.exports = ({ ipld, preload }) => {
  return async function _new (template, options) {
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
}
