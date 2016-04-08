'use strict'

module.exports = (send) => {
  return {
    add (hash, opts, cb) {
      if (typeof opts === 'function') {
        cb = opts
        opts = null
      }

      return send('pin/add', hash, opts, null, cb)
    },
    remove (hash, opts, cb) {
      if (typeof opts === 'function') {
        cb = opts
        opts = null
      }

      return send('pin/rm', hash, opts, null, cb)
    },
    list (type, cb) {
      if (typeof type === 'function') {
        cb = type
        type = null
      }
      let opts = null
      let hash = null
      if (typeof type === 'string') {
        opts = { type: type }
      } else if (type && type.hash) {
        hash = type.hash
        type.hash = null
        opts = type
      }

      return send('pin/ls', hash, opts, null, cb)
    }
  }
}
