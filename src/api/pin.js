'use strict'

module.exports = send => {
  return {
    add (hash, opts, cb) {
      if (typeof opts === 'function') {
        cb = opts
        opts = null
      }

      send('pin/add', hash, opts, null, cb)
    },
    remove (hash, opts, cb) {
      if (typeof opts === 'function') {
        cb = opts
        opts = null
      }

      send('pin/rm', hash, opts, null, cb)
    },
    list (type, cb) {
      if (typeof type === 'function') {
        cb = type
        type = null
      }
      let opts = null
      if (type) opts = { type: type }
      return send('pin/ls', null, opts, null, cb)
    }
  }
}
