'use strict'

const dagPB = require('ipld-dag-pb')

const calculateCid = node => dagPB.util.cid(node.serialize(), { cidVersion: 0 })

const asDAGLink = async (node, name = '') => {
  const cid = await calculateCid(node)
  return new dagPB.DAGLink(name, node.size, cid)
}

module.exports = {
  calculateCid,
  asDAGLink
}
