'use strict'

const streamifier = require('streamifier')

module.exports = (send) => {
  return {
    get (key, callback) {
      if (typeof key === 'function') {
        callback = key
        key = undefined
      }

      if (!key) {
        return send('config/show', null, null, null, true, callback)
      }

      return send('config', key, null, null, (err, result) => {
        if (err) {
          return callback(err)
        }
        callback(null, result.Value)
      })
    },
    set (key, value, opts, callback) {
      if (typeof opts === 'function') {
        callback = opts
        opts = {}
      }
      if (typeof key !== 'string') {
        return callback(new Error('Invalid key type'))
      }

      if (typeof value !== 'object' &&
          typeof value !== 'boolean' &&
          typeof value !== 'string') {
        return callback(new Error('Invalid value type'))
      }

      if (typeof value === 'object') {
        value = JSON.stringify(value)
        opts = { json: true }
      }

      if (typeof value === 'boolean') {
        value = value.toString()
        opts = { bool: true }
      }

      return send('config', [key, value], opts, null, callback)
    },
    replace (config, callback) {
      // Its a path
      if (typeof config === 'string') {
        return send('config/replace', null, null, config, callback)
      }

      // Its a config obj
      if (typeof config === 'object') {
        config = streamifier.createReadStream(new Buffer(JSON.stringify(config)))
        return send('config/replace', null, null, config, callback)
      }
    }
  }
}
