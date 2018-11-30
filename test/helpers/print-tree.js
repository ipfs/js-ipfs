'use strict'

const load = async (cid, mfs) => {
  return new Promise((resolve, reject) => {
    mfs.ipld.get(cid, (err, res) => {
      if (err) {
        return reject(err)
      }

      resolve(res.value)
    })
  })
}

const printTree = async (cid, mfs, indentation = '', name = '') => {
  console.info(indentation, name, cid.toBaseEncodedString()) // eslint-disable-line no-console

  const node = await load(cid, mfs)

  for (let i = 0; i < node.links.length; i++) {
    await printTree(node.links[i].cid, mfs, `  ${indentation}`, node.links[i].name)
  }
}

module.exports = printTree
