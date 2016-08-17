'use strict'

const map = require('async/map')
const getDagNode = require('./get-dagnode')

// transform { Hash: '...' } objects into { path: 'string', node: DAGNode }
module.exports = function (err, res, send, done) {
  if (err) {
    return done(err)
  }

  map(res, function map (entry, next) {
    getDagNode(send, entry.Hash, function (err, node) {
      if (err) {
        return next(err)
      }
      var obj = {
        path: entry.Name,
        hash: entry.Hash,
        size: node.size()
      }
      next(null, obj)
    })
  }, function (err, res) {
    done(err, res)
  })
}
