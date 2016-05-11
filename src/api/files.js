'use strict'

const argCommand = require('../cmd-helpers').argCommand

module.exports = (send) => {
  return {
    cp: argCommand(send, 'files/cp'),
    ls: argCommand(send, 'files/ls'),
    mkdir: argCommand(send, 'files/mkdir'),
    stat: argCommand(send, 'files/stat'),
    rm: function (path, opts, cb) {
      if (typeof opts === 'function' && cb === undefined) {
        cb = opts
        opts = {}
      }
      return send('files/rm', path, opts, null, cb)
    },
    read: argCommand(send, 'files/read'),
    write: function (pathDst, files, opts, cb) {
      if (typeof opts === 'function' && cb === undefined) {
        cb = opts
        opts = {}
      }
      return send('files/write', pathDst, opts, files, cb)
    },
    mv: argCommand(send, 'files/mv')
  }
}
