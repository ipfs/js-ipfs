'use strict'

const waterfall = require('async/waterfall')
const timesSeries = require('async/timesSeries')
const map = require('async/map')

function identify (node, cb) {
  node.id((err, id) => {
    if (err) return cb(err)
    node.peerId = id
    cb(null, node)
  })
}

// Spawn a node, get it's id and set it as `peerId` on the node
function spawnNodeWithId (factory, callback) {
  waterfall([(cb) => factory.spawnNode(cb), identify], callback)
}

exports.spawnNodeWithId = spawnNodeWithId

// Spawn n nodes
function spawnNodes (n, factory, callback) {
  timesSeries(n, (_, cb) => factory.spawnNode(cb), callback)
}

exports.spawnNodes = spawnNodes

// Spawn n nodes, getting their id's and setting them as `peerId` on the nodes
function spawnNodesWithId (n, factory, callback) {
  spawnNodes(n, factory, (err, nodes) => {
    if (err) return callback(err)
    map(nodes, identify, callback)
  })
}

exports.spawnNodesWithId = spawnNodesWithId
