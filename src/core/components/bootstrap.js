'use strict'

const isNode = require('detect-node')

const defaultNodes = isNode
  ? require('../../init-files/default-config-node.json').Bootstrap
  : require('../../init-files/default-config-browser.json').Bootstrap

module.exports = function bootstrap (self) {
  return {
    list: (callback) => {
      self._repo.config.get((err, config) => {
        if (err) {
          return callback(err)
        }
        callback(null, {Peers: config.Bootstrap})
      })
    },
    add: (multiaddr, args, callback) => {
      if (typeof args === 'function') {
        callback = args
        args = {default: false}
      }
      self._repo.config.get((err, config) => {
        if (err) {
          return callback(err)
        }
        if (args.default) {
          config.Bootstrap = defaultNodes
        } else if (multiaddr) {
          config.Bootstrap.push(multiaddr)
        }
        self._repo.config.set(config, (err) => {
          if (err) {
            return callback(err)
          }

          callback(null, {
            Peers: args.default ? defaultNodes : [multiaddr]
          })
        })
      })
    },
    rm: (multiaddr, args, callback) => {
      if (typeof args === 'function') {
        callback = args
        args = {all: false}
      }
      self._repo.config.get((err, config) => {
        if (err) {
          return callback(err)
        }
        if (args.all) {
          config.Bootstrap = []
        } else {
          config.Bootstrap = config.Bootstrap.filter((mh) => mh !== multiaddr)
        }

        self._repo.config.set(config, (err) => {
          if (err) {
            return callback(err)
          }

          const res = []
          if (!args.all && multiaddr) {
            res.push(multiaddr)
          }

          callback(null, {Peers: res})
        })
      })
    }
  }
}
