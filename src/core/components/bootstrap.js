'use strict'

const defaultConfig = require('../runtime/config-nodejs.js')
const isMultiaddr = require('mafmt').IPFS.matches
const promisify = require('promisify-es6')

function isValidMultiaddr (ma) {
  try {
    return isMultiaddr(ma)
  } catch (err) {
    return false
  }
}

function invalidMultiaddrError (ma) {
  return new Error(`${ma} is not a valid Multiaddr`)
}

module.exports = function bootstrap (self) {
  return {
    list: promisify((callback) => {
      self._repo.config.get((err, config) => {
        if (err) {
          return callback(err)
        }
        callback(null, {Peers: config.Bootstrap})
      })
    }),
    add: promisify((multiaddr, args, callback) => {
      if (typeof args === 'function') {
        callback = args
        args = { default: false }
      }

      if (multiaddr && !isValidMultiaddr(multiaddr)) {
        return setImmediate(() => callback(invalidMultiaddrError(multiaddr)))
      }

      self._repo.config.get((err, config) => {
        if (err) {
          return callback(err)
        }
        if (args.default) {
          config.Bootstrap = defaultConfig().Bootstrap
        } else if (multiaddr && config.Bootstrap.indexOf(multiaddr) === -1) {
          config.Bootstrap.push(multiaddr)
        }
        self._repo.config.set(config, (err) => {
          if (err) {
            return callback(err)
          }

          callback(null, {
            Peers: args.default ? defaultConfig().Bootstrap : [multiaddr]
          })
        })
      })
    }),
    rm: promisify((multiaddr, args, callback) => {
      if (typeof args === 'function') {
        callback = args
        args = {all: false}
      }
      if (multiaddr && !isValidMultiaddr(multiaddr)) {
        return setImmediate(() => callback(invalidMultiaddrError(multiaddr)))
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
    })
  }
}
