'use strict'

const argCommand = require('../cmd-helpers').argCommand

module.exports = (send) => {
  return {
    get: argCommand(send, 'config'),
    set (key, value, opts, cb) {
      if (typeof (opts) === 'function') {
        cb = opts
        opts = {}
      }

      if (typeof (value) === 'object') {
        value = JSON.stringify(value)
        opts = { json: true }
      } else if (typeof (value) === 'boolean') {
        value = value.toString()
        opts = { bool: true }
      }

      return send('config', [key, value], opts, null, cb)
    },
    show (cb) {
      return send('config/show', null, null, null, true, cb)
    },
    replace (file, cb) {
      return send('config/replace', null, null, file, cb)
    }
  }
}
