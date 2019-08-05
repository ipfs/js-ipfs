'use strict'

const createShard = require('./create-shard')
const printTree = require('./print-tree')

// find specific hamt structure by brute force
const findTreeWithDepth = async (ipld, children, depth) => {
  for (let i = 2550; i < 100000; i++) {
    const files = new Array(i).fill(0).map((_, index) => ({
      path: `foo/file-${index}`,
      content: Buffer.from([0, 1, 2, 3, 4, index])
    }))

    const cid = await createShard(ipld, files)
    const hasChildrenAtDepth = await findChildrenAtDepth(ipld, cid, children, depth)

    if (hasChildrenAtDepth) {
      await printTree(ipld, cid)

      return cid
    }
  }
}

const load = (ipld, cid) => {
  return new Promise((resolve, reject) => {
    ipld.get(cid, (err, res) => {
      if (err) {
        return reject(err)
      }

      resolve(res.value)
    })
  })
}

const findChildrenAtDepth = async (ipld, cid, children, depth, currentDepth = 0) => {
  const node = await load(ipld, cid)
  const fileLinks = node.links.filter(link => link.Name)

  if (currentDepth === depth && fileLinks.length >= children) {
    return true
  }

  for (let i = 0; i < fileLinks.length; i++) {
    const res = await findChildrenAtDepth(ipld, fileLinks[i].cid, children, depth, currentDepth + 1)

    if (res) {
      return true
    }
  }

  return false
}

module.exports = findTreeWithDepth
