'use strict'

module.exports = (send) => {
  return {
    add (hash, opts, callback) {
      if (typeof opts === 'function') {
        callback = opts
        opts = null
      }
      return send({
        path: 'pin/add',
        args: hash,
        qs: opts
      }, callback)
    },
    remove (hash, opts, callback) {
      if (typeof opts === 'function') {
        callback = opts
        opts = null
      }
      return send({
        path: 'pin/rm',
        args: hash,
        qs: opts
      }, callback)
    },
    list (type, callback) {
      if (typeof type === 'function') {
        callback = type
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
      return send({
        path: 'pin/ls',
        args: hash,
        qs: opts
      }, callback)
    }
  }
}
