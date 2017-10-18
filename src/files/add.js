'use strict'

const isStream = require('is-stream')
const promisify = require('promisify-es6')
const ProgressStream = require('../utils/progress-stream')
const converter = require('../utils/converter')

module.exports = (send) => {
  return promisify((files, opts, callback) => {
    if (typeof opts === 'function') {
      callback = opts
      opts = {}
    }

    opts = opts || {}

    const ok = Buffer.isBuffer(files) ||
               isStream.readable(files) ||
               Array.isArray(files)

    if (!ok) {
      return callback(new Error('"files" must be a buffer, readable stream, or array of objects'))
    }

    const qs = {}

    if (opts['cid-version'] != null) {
      qs['cid-version'] = opts['cid-version']
    } else if (opts.cidVersion != null) {
      qs['cid-version'] = opts.cidVersion
    }

    if (opts['raw-leaves'] != null) {
      qs['raw-leaves'] = opts['raw-leaves']
    } else if (opts.rawLeaves != null) {
      qs['raw-leaves'] = opts.rawLeaves
    }

    if (opts.hash != null) {
      qs.hash = opts.hash
    } else if (opts.hashAlg != null) {
      qs.hash = opts.hashAlg
    }

    const request = { path: 'add', files: files, qs: qs, progress: opts.progress }

    send.andTransform(request, (response, cb) => {
      converter(ProgressStream.fromStream(opts.progress, response), cb)
    }, callback)
  })
}
