'use strict'

module.exports = function bootstrap (self) {
  return {
    list: (callback) => {
      self._repo.config.get((err, config) => {
        if (err) {
          return callback(err)
        }
        callback(null, config.Bootstrap)
      })
    },
    add: (multiaddr, callback) => {
      self._repo.config.get((err, config) => {
        if (err) {
          return callback(err)
        }
        config.Bootstrap.push(multiaddr)
        self._repo.config.set(config, callback)
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

        self._repo.config.set(config, callback)
      })
    }
  }
}
