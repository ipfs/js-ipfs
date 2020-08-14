'use strict'

const dagPB = require('ipld-dag-pb')
const DAGNode = dagPB.DAGNode
const multicodec = require('multicodec')
const Unixfs = require('ipfs-unixfs')
const { withTimeoutOption } = require('../../utils')

module.exports = ({ ipld, preload }) => {
  return withTimeoutOption(async function _new (options = {}) {
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
  })
}
