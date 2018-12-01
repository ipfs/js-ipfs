'use strict'

const createShard = require('./create-shard')
const printTree = require('./print-tree')

// find specific hamt structure by brute force
const findTreeWithDepth = async (mfs, children, depth) => {
  for (let i = 10; i < 100000; i++) {
    const files = new Array(i).fill(0).map((_, index) => ({
      path: `foo/file-${index}`,
      content: Buffer.from([0, 1, 2, 3, 4, index])
    }))

    const cid = await createShard(mfs, files)
    const hasChildrenAtDepth = await findChildrenAtDepth(mfs, cid, children, depth)

    if (hasChildrenAtDepth) {
      await printTree(mfs, cid)

      return cid
    }
  }
}

const load = async (mfs, cid) => {
  return new Promise((resolve, reject) => {
    mfs.ipld.get(cid, (err, res) => {
      if (err) {
        return reject(err)
      }

      resolve(res.value)
    })
  })
}

const findChildrenAtDepth = async (mfs, cid, children, depth, currentDepth = 0) => {
  const node = await load(mfs, cid)
  const fileLinks = node.links.filter(link => link.name)

  if (currentDepth === depth && fileLinks.length >= children) {
    return true
  }

  for (let i = 0; i < fileLinks.length; i++) {
    const res = await findChildrenAtDepth(mfs, fileLinks[i].cid, children, depth, currentDepth + 1)

    if (res) {
      return true
    }
  }

  return false
}

module.exports = findTreeWithDepth
