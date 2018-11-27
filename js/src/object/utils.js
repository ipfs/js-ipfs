'use strict'

const { promisify } = require('es6-promisify')
const dagPB = require('ipld-dag-pb')
const { DAGNode, DAGLink } = dagPB

module.exports.calculateCid = promisify((node, cb) => {
  dagPB.util.cid(node, cb)
})

module.exports.createDAGNode = promisify((data, links, cb) => {
  DAGNode.create(data, links, cb)
})

module.exports.addLinkToDAGNode = promisify((parent, link, cb) => {
  DAGNode.addLink(parent, link, cb)
})

module.exports.asDAGLink = promisify((node, name, cb) => {
  if (typeof name === 'function') {
    cb = name
    name = ''
  }

  dagPB.util.cid(node, (err, nodeCid) => {
    if (err) {
      return cb(err)
    }

    DAGLink.create(name, node.size, nodeCid, cb)
  })
})
