'use strict'

const map = require('async/map')
const getDagNode = require('./get-dagnode')

// transform { Hash: '...' } objects into { path: 'string', node: DAGNode }
module.exports = (err, res, send, done) => {
  if (err) {
    return done(err)
  }

  map(res, (entry, next) => {
    getDagNode(send, entry.Hash, (err, node) => {
      if (err) {
        return next(err)
      }
      node.size((err, size) => {
        if (err) {
          return next(err)
        }
        const obj = {
          path: entry.Name,
          hash: entry.Hash,
          size: size
        }
        next(null, obj)
      })
    })
  }, (err, res) => {
    done(err, res)
  })
}
