'use strict'

const promisify = require('promisify-es6')

module.exports = (send) => {
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
