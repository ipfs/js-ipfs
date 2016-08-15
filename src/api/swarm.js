'use strict'

module.exports = (send) => {
  return {
    peers (opts, callback) {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      return send({
        path: 'swarm/peers',
        qs: opts
      }, callback)
    },
    connect (args, opts, callback) {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      return send({
        path: 'swarm/connect',
        args: args,
        qs: opts
      }, callback)
    },
    disconnect (args, opts, callback) {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      return send({
        path: 'swarm/disconnect',
        args: args,
        qs: opts
      }, callback)
    },
    addrs (opts, callback) {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      return send({
        path: 'swarm/addrs',
        qs: opts
      }, callback)
    },
    localAddrs (opts, callback) {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      return send({
        path: 'swarm/addrs/local',
        qs: opts
      }, callback)
    }
  }
}
