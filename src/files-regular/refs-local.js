'use strict'

const promisify = require('promisify-es6')
const streamToValueWithTransformer = require('../utils/stream-to-value-with-transformer')
const moduleConfig = require('../utils/module-config')

module.exports = (arg) => {
  const send = moduleConfig(arg)

  return promisify((opts, callback) => {
    if (typeof (opts) === 'function') {
      callback = opts
      opts = {}
    }

    const transform = (res, cb) => {
      cb(null, res.map(r => ({ ref: r.Ref, err: r.Err })))
    }

    const request = {
      path: 'refs/local',
      qs: opts
    }
    send(request, (err, result) => {
      if (err) {
        return callback(err)
      }

      streamToValueWithTransformer(result, transform, callback)
    })
  })
}
