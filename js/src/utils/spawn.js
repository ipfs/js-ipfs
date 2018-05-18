const waterfall = require('async/waterfall')
const timesSeries = require('async/timesSeries')

// Spawn a node, get it's id and set it as `peerId` on the node
function spawnNodeWithId (factory, callback) {
  waterfall([
    (cb) => factory.spawnNode(cb),
    (node, cb) => node.id((err, id) => {
      if (err) return cb(err)
      node.peerId = id
      cb(null, node)
    })
  ], callback)
}

exports.spawnNodeWithId = spawnNodeWithId

// Spawn n nodes
function spawnNodes (n, factory, callback) {
  timesSeries(n, (_, cb) => factory.spawnNode(cb), callback)
}

exports.spawnNodes = spawnNodes

// Spawn n nodes, getting their id's and setting them as `peerId` on the nodes
function spawnNodesWithId (n, factory, callback) {
  timesSeries(n, (_, cb) => spawnNodeWithId(factory, cb), callback)
}

exports.spawnNodesWithId = spawnNodesWithId
