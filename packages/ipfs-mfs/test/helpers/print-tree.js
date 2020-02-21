'use strict'

const printTree = async (ipld, cid, indentation = '', name = '') => {
  console.info(`${indentation} ${name} ${cid}`) // eslint-disable-line no-console

  const node = await ipld.get(cid)
  const fileLinks = node.Links
    .filter(link => link.Name)

  for (let i = 0; i < fileLinks.length; i++) {
    await printTree(ipld, fileLinks[i].Hash, `  ${indentation}`, fileLinks[i].Name)
  }
}

module.exports = printTree
