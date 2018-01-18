
'use strict'

const promisify = require('promisify-es6')

const transform = function (res, callback) {
  callback(null, {
    numObjects: res.NumObjects,
    repoSize: res.RepoSize,
    repoPath: res.RepoPath,
    version: res.Version,
    storageMax: res.StorageMax
  })
}

module.exports = (send) => {
  return promisify((opts, callback) => {
    if (typeof (opts) === 'function') {
      callback = opts
      opts = {}
    }

    send.andTransform({
      path: 'stats/repo',
      qs: opts
    }, transform, callback)
  })
}
