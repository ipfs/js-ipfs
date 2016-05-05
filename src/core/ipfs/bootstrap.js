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
    rm: (multiaddr, callback) => {
      self._repo.config.get((err, config) => {
        if (err) {
          return callback(err)
        }

        config.Bootstrap = config.Bootstrap.filter((mh) => {
          if (mh === multiaddr) {
            return false
          } else {
            return true
          }
        })
        self._repo.config.set(config, callback)
      })
    }
  }
}
