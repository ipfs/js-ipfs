'use strict'

const promisify = require('promisify-es6')
const moduleConfig = require('./utils/module-config')

module.exports = (arg) => {
  const send = moduleConfig(arg)

  return promisify((opts, callback) => {
    if (typeof opts === 'function') {
      callback = opts
      opts = {}
    }

    send({
      path: 'version',
      qs: opts
    }, (err, result) => {
      if (err) {
        return callback(err)
      }
      const version = {
        version: result.Version,
        commit: result.Commit,
        repo: result.Repo
      }
      callback(null, version)
    })
  })
}
