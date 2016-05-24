'use strict'

const async = require('async')
const getDagNode = require('./get-dagnode')

// transform { Hash: '...' } objects into DAGNodes async
module.exports = function (err, res, send, done) {
  if (err) return done(err)
  async.map(res, function map (entry, next) {
    getDagNode(send, entry.Hash, next)
  }, function (err, res) {
    done(err, res)
  })
}
