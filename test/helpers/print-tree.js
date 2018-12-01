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

const printTree = async (mfs, cid, indentation = '', name = '') => {
  console.info(indentation, name, cid.toBaseEncodedString()) // eslint-disable-line no-console

  const node = await load(cid, mfs)
  const fileLinks = node.links
    .filter(link => link.name)

  for (let i = 0; i < fileLinks.length; i++) {
    await printTree(mfs, fileLinks[i].cid, `  ${indentation}`, fileLinks[i].name)
  }
}

module.exports = printTree
