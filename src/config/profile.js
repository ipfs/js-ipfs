'use strict'

const promisify = require('promisify-es6')

const toObject = function (res, callback) {
  if (Buffer.isBuffer(res)) {
    callback(null, JSON.parse(res.toString()))
  } else {
    callback(null, res)
  }
}

module.exports = (send) => {
  return promisify((profile, opts, callback) => {
    if (typeof opts === 'function') {
      callback = opts
      opts = {}
    }

    opts = normalizeOpts(opts)

    send.andTransform({
      path: 'config/profile/apply',
      args: profile,
      qs: opts
    }, toObject, (err, response) => {
      if (err) {
        return callback(err)
      }
      callback(null, { oldCfg: response.OldCfg, newCfg: response.NewCfg })
    })
  })
}

function normalizeOpts (opts) {
  opts = opts || {}
  if (typeof opts.dryRun !== 'undefined') {
    opts['dry-run'] = opts.dryRun
  }
  return opts
}
