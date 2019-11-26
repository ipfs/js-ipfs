'use strict'

const { promisify } = require('es6-promisify')
const dagPB = require('ipld-dag-pb')
const { DAGNode, DAGLink } = dagPB

const calculateCid = (node) => dagPB.util.cid(node.serialize(), { cidVersion: 0 })

const createDAGNode = promisify((data, links, cb) => {
  cb(null, new DAGNode(data, links))
})

const addLinkToDAGNode = promisify((parent, link, cb) => {
  cb(null, new DAGNode(parent.Data, parent.Links.concat(link)))
})

const asDAGLink = async (node, name = '') => {
  const cid = await calculateCid(node)

  return new DAGLink(name, node.size, cid)
}

module.exports = {
  calculateCid,
  createDAGNode,
  addLinkToDAGNode,
  asDAGLink
}
