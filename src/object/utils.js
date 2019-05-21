'use strict'

const { promisify } = require('es6-promisify')
const dagPB = require('ipld-dag-pb')
const { DAGNode, DAGLink } = dagPB

const calculateCid = promisify((node, cb) => {
  dagPB.util.cid(dagPB.util.serialize(node), {
    cidVersion: 0
  })
    .then(cid => cb(null, cid), cb)
})

const createDAGNode = promisify((data, links, cb) => {
  cb(null, DAGNode.create(data, links))
})

const addLinkToDAGNode = promisify((parent, link, cb) => {
  DAGNode.addLink(parent, link)
    .then(node => cb(null, node), cb)
})

const asDAGLink = promisify((node, name, cb) => {
  if (typeof name === 'function') {
    cb = name
    name = ''
  }

  calculateCid(node, (err, cid) => {
    if (err) {
      return cb(err)
    }

    cb(null, new DAGLink(name, node.size, cid))
  })
})

module.exports = {
  calculateCid,
  createDAGNode,
  addLinkToDAGNode,
  asDAGLink
}
