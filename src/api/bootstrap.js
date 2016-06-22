'use strict'

const command = require('../cmd-helpers').command

module.exports = (send) => {
  return {
    add: (arg, opts, cb) => {
      if (typeof opts === 'function' && cb === undefined) {
        cb = opts
        opts = {}
      }
      return send('bootstrap/add', arg, opts, null, cb)
    },
    rm: (arg, opts, cb) => {
      if (typeof opts === 'function' && cb === undefined) {
        cb = opts
        opts = {}
      }
      return send('bootstrap/rm', arg, opts, null, cb)
    },
    list: command(send, 'bootstrap/list')
  }
}
