'use strict'

module.exports = function traverseLeafNodes (mfs, cid) {
  async function * traverse (cid) {
    const node = await mfs.ipld.get(cid)

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
