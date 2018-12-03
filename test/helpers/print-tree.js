'use strict'

const load = async (cid, ipld) => {
  return new Promise((resolve, reject) => {
    ipld.get(cid, (err, res) => {
      if (err) {
        return reject(err)
      }

      resolve(res.value)
    })
  })
}

const printTree = async (ipld, cid, indentation = '', name = '') => {
  console.info(indentation, name, cid.toBaseEncodedString()) // eslint-disable-line no-console

  const node = await load(cid, ipld)
  const fileLinks = node.links
    .filter(link => link.name)

  for (let i = 0; i < fileLinks.length; i++) {
    await printTree(ipld, fileLinks[i].cid, `  ${indentation}`, fileLinks[i].name)
  }
}

module.exports = printTree
