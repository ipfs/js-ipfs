'use strict'

const IsIpfs = require('is-ipfs')
const promisify = require('promisify-es6')
const streamToValueWithTransformer = require('../utils/stream-to-value-with-transformer')
const moduleConfig = require('../utils/module-config')
const cleanCID = require('../utils/clean-cid')

module.exports = (arg) => {
  const send = moduleConfig(arg)

  const refs = promisify((args, opts, callback) => {
    if (typeof (opts) === 'function') {
      callback = opts
      opts = {}
    }
    opts = module.exports.normalizeOpts(opts)

    try {
      args = module.exports.checkArgs(args)
    } catch (err) {
      return callback(err)
    }

    const transform = (res, cb) => {
      cb(null, res.map(r => ({ ref: r.Ref, err: r.Err })))
    }

    const request = {
      args,
      path: 'refs',
      qs: opts
    }
    send(request, (err, result) => {
      if (err) {
        return callback(err)
      }

      streamToValueWithTransformer(result, transform, callback)
    })
  })

  refs.local = require('./refs-local')(arg)
  refs.localReadableStream = require('./refs-local-readable-stream')(arg)
  refs.localPullStream = require('./refs-local-pull-stream')(arg)

  return refs
}

module.exports.checkArgs = (args) => {
  const isArray = Array.isArray(args)
  args = isArray ? args : [args]

  const res = []
  for (let arg of args) {
    try {
      arg = cleanCID(arg)
    } catch (err) {
      if (!IsIpfs.ipfsPath(arg)) {
        throw err
      }
    }
    res.push(arg)
  }

  return isArray ? res : res[0]
}

module.exports.normalizeOpts = (opts) => {
  opts = opts || {}
  if (typeof opts.maxDepth === 'number') {
    opts['max-depth'] = opts.maxDepth
  }
  return opts
}
