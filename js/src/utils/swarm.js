'use strict'

const eachSeries = require('async/eachSeries')

function connect (fromNode, toAddrs, cb) {
  if (!Array.isArray(toAddrs)) {
    toAddrs = [toAddrs]
  }

  // FIXME ??? quick connections to different nodes sometimes cause no
  // connection and no error, hence serialize connections and pause between
  eachSeries(toAddrs, (toAddr, cb) => {
    fromNode.swarm.connect(toAddr, (err) => {
      if (err) return cb(err)
      setTimeout(cb, 300)
    })
  }, cb)
}

module.exports.connect = connect
