'use strict'
const { Buffer } = require('buffer')

module.exports = function traverseLeafNodes (ipfs, cid) {
  async function * traverse (cid) {
    const { value: node } = await ipfs.dag.get(cid)

    if (Buffer.isBuffer(node) || !node.Links.length) {
      yield {
        node,
        cid
      }

      return
    }

    node.Links.forEach(link => traverse(link.Hash))
  }

  return traverse(cid)
}
