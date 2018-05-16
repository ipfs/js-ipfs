const waterfall = require('async/waterfall')

function waitUntilConnected (fromNode, toNode, opts, cb) {
  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }

  opts = opts || {}
  opts.timeout = opts.timeout || 30000
  opts.interval = opts.interval || 1000

  const startTime = Date.now()
  const checkConnected = () => {
    isConnected(fromNode, toNode, (err, connected) => {
      if (err) return cb(err)
      if (connected) return cb()

      if (Date.now() > startTime + opts.timeout) {
        return cb(new Error('timeout waiting for connected nodes'))
      }

      setTimeout(checkConnected, opts.interval)
    })
  }

  checkConnected()
}

exports.waitUntilConnected = waitUntilConnected

function isConnected (fromNode, toNode, cb) {
  waterfall([
    (cb) => {
      if (toNode.peerId) return cb(null, toNode.peerId)
      toNode.id((err, id) => {
        if (err) return cb(err)
        toNode.peerId = id
        cb(null, id)
      })
    },
    (toPeerId, cb) => {
      fromNode.swarm.peers((err, peers) => {
        if (err) return cb(err)
        cb(null, peers.some((p) => p.peer.toJSON().id === toPeerId.id))
      })
    }
  ], cb)
}

exports.isConnected = isConnected
