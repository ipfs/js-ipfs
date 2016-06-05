'use strict'

const async = require('async')
const getDagNode = require('./get-dagnode')

// transform { Hash: '...' } objects into { path: 'string', node: DAGNode }
module.exports = function (err, res, send, done) {
  if (err) {
    return done(err)
  }
  async.map(res, function map (entry, next) {
    getDagNode(send, entry.Hash, function (err, node) {
      if (err) {
        return next(err)
      }
      var obj = {
        path: entry.Name,
        node: node
      }
      next(null, obj)
    })
  }, function (err, res) {
    done(err, res)
  })
}
