'use strict'

module.exports = function traverseLeafNodes (ipfs, cid) {
  async function * traverse (cid) {
    const { value: node } = await ipfs.dag.get(cid)

    if (node instanceof Uint8Array || !node.Links.length) {
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
