'use strict'

const promisify = require('promisify-es6')

module.exports = function config (self) {
  return {
    get: promisify((key, callback) => {
      if (typeof key === 'function') {
        callback = key
        key = undefined
      }

      if (!key) {
        return self._repo.config.get(callback)
      }

      if (typeof key !== 'string') {
        return callback(new Error('Invalid key type'))
      }

      self._repo.config.get((err, config) => {
        if (err) {
          return callback(err)
        }
        const keys = key.split('.')
        let finished = false
        keys.forEach((key) => {
          if (finished) {
            return
          }
          if (config[key]) {
            config = config[key]
          } else {
            finished = true
            callback(new Error(('Key does not exist in config')))
          }
        })
        if (!finished) {
          callback(null, config)
        }
      })
    }),
    set: promisify((key, value, callback) => {
      if (!key || typeof key !== 'string') {
        return callback(new Error('Invalid key type'))
      }

      if (!value || Buffer.isBuffer(value)) {
        return callback(new Error('Invalid value type'))
      }

      self._repo.config.get((err, config) => {
        const configBak = config
        if (err) {
          return callback(err)
        }
        const keys = key.split('.')
        let finished = false
        keys.forEach((key, index) => {
          if (finished) {
            return
          }
          if (config[key]) {
            if (index === keys.length - 1) {
              finished = true
              config[key] = value
            }
            config = config[key]
          } else {
            if (index === keys.length - 1) {
              finished = true
              config[key] = value
            } else {
              config = config[key] = {}
            }
          }
        })

        self.config.replace(configBak, callback)
      })
    }),
    replace: promisify((config, callback) => {
      self._repo.config.set(config, callback)
    })
  }
}
