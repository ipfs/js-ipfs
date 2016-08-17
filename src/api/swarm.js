'use strict'

const promisify = require('promisify-es6')
const multiaddr = require('multiaddr')

module.exports = (send) => {
  return {
    peers: promisify((opts, callback) => {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      send({
        path: 'swarm/peers',
        qs: opts
      }, (err, result) => {
        if (err) {
          return callback(err)
        }
        callback(null, result.Strings.map((addr) => {
          return multiaddr(addr)
        }))
      })
    }),
    connect: promisify((args, opts, callback) => {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      send({
        path: 'swarm/connect',
        args: args,
        qs: opts
      }, callback)
    }),
    disconnect: promisify((args, opts, callback) => {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      send({
        path: 'swarm/disconnect',
        args: args,
        qs: opts
      }, callback)
    }),
    addrs: promisify((opts, callback) => {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      send({
        path: 'swarm/addrs',
        qs: opts
      }, (err, result) => {
        if (err) {
          return callback(err)
        }
        callback(null, Object.keys(result.Addrs).map((id) => {
          return result.Addrs[id].map((maStr) => {
            return multiaddr(maStr).encapsulate('/ipfs/' + id)
          })
        })[0])
      })
    }),
    localAddrs: promisify((opts, callback) => {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      send({
        path: 'swarm/addrs/local',
        qs: opts
      }, (err, result) => {
        if (err) {
          return callback(err)
        }
        callback(null, result.Strings.map((addr) => {
          return multiaddr(addr)
        }))
      })
    })
  }
}
