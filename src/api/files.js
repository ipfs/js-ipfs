'use strict'

const promisify = require('promisify-es6')

module.exports = (send) => {
  return {
    cp: promisify((args, opts, callback) => {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      send({
        path: 'files/cp',
        args: args,
        qs: opts
      }, callback)
    }),
    ls: promisify((args, opts, callback) => {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      return send({
        path: 'files/ls',
        args: args,
        qs: opts
      }, callback)
    }),
    mkdir: promisify((args, opts, callback) => {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      send({
        path: 'files/mkdir',
        args: args,
        qs: opts
      }, callback)
    }),
    stat: promisify((args, opts, callback) => {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      send({
        path: 'files/stat',
        args: args,
        qs: opts
      }, callback)
    }),
    rm: promisify((path, opts, callback) => {
      if (typeof opts === 'function' &&
          !callback) {
        callback = opts
        opts = {}
      }

      // opts is the real callback --
      // 'callback' is being injected by promisify
      if (typeof opts === 'function' &&
          typeof callback === 'function') {
        callback = opts
        opts = {}
      }

      send({
        path: 'files/rm',
        args: path,
        qs: opts
      }, callback)
    }),
    read: promisify((args, opts, callback) => {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      send({
        path: 'files/read',
        args: args,
        qs: opts
      }, callback)
    }),
    write: promisify((pathDst, files, opts, callback) => {
      if (typeof opts === 'function' &&
          !callback) {
        callback = opts
        opts = {}
      }

      // opts is the real callback --
      // 'callback' is being injected by promisify
      if (typeof opts === 'function' &&
          typeof callback === 'function') {
        callback = opts
        opts = {}
      }

      send({
        path: 'files/write',
        args: pathDst,
        qs: opts,
        files: files
      }, callback)
    }),
    mv: promisify((args, opts, callback) => {
      if (typeof opts === 'function' &&
          callback === undefined) {
        callback = opts
        opts = {}
      }
      send({
        path: 'files/mv',
        args: args,
        qs: opts
      }, callback)
    })
  }
}
