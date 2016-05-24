'use strict'

const DAGNode = require('ipfs-merkle-dag').DAGNode

module.exports = function (send, hash, cb) {
  send('object/get', hash, null, null, function (err, result) {
    if (err) return cb(err)
    const node = new DAGNode(result.Data, result.Links)
    cb(err, node)
  })
}
