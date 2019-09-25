'use strict'

const { promisify } = require('es6-promisify')
const callbackify = require('callbackify')
const dagPB = require('ipld-dag-pb')
const { DAGNode, DAGLink } = dagPB

const calculateCid = callbackify((node) => {
  return dagPB.util.cid(node.serialize(), {
    cidVersion: 0
  })
})

const createDAGNode = promisify((data, links, cb) => {
  cb(null, new DAGNode(data, links))
})

const addLinkToDAGNode = promisify((parent, link, cb) => {
  cb(null, new DAGNode(parent.Data, parent.Links.concat(link)))
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
