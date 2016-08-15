'use strict'

module.exports = (send) => {
  return {
    cp (args, opts, callback) {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      return send({
        path: 'files/cp',
        args: args,
        qs: opts
      }, callback)
    },
    ls (args, opts, callback) {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      return send({
        path: 'files/ls',
        args: args,
        qs: opts
      }, callback)
    },
    mkdir (args, opts, callback) {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      return send({
        path: 'files/mkdir',
        args: args,
        qs: opts
      }, callback)
    },
    stat (args, opts, callback) {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      return send({
        path: 'files/stat',
        args: args,
        qs: opts
      }, callback)
    },
    rm (path, opts, callback) {
      if (typeof opts === 'function' &&
          callback === undefined) {
        callback = opts
        opts = {}
      }
      return send({
        path: 'files/rm',
        args: path,
        qs: opts
      }, callback)
    },
    read (args, opts, callback) {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      return send({
        path: 'files/read',
        args: args,
        qs: opts
      }, callback)
    },
    write (pathDst, files, opts, callback) {
      if (typeof opts === 'function' && callback === undefined) {
        callback = opts
        opts = {}
      }

      return send({
        path: 'files/write',
        args: pathDst,
        qs: opts,
        files: files
      }, callback)
    },
    mv (args, opts, callback) {
      if (typeof opts === 'function' &&
          callback === undefined) {
        callback = opts
        opts = {}
      }
      return send({
        path: 'files/mv',
        args: args,
        qs: opts
      }, callback)
    }
  }
}
