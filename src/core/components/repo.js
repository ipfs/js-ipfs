'use strict'

const promisify = require('promisify-es6')

module.exports = function repo (self) {
  return {
    init: (bits, empty, callback) => {
      // 1. check if repo already exists
    },

    version: promisify((callback) => {
      self._repo.version.get(callback)
    }),

    gc: () => {},

    stat: promisify((options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }

      self._repo.stat(options, (err, stats) => {
        if (err) return callback(err)

        callback(null, {
          numObjects: stats.numObjects,
          repoSize: stats.repoSize,
          repoPath: stats.repoPath,
          version: stats.version.toString(),
          storageMax: stats.storageMax
        })
      })
    }),

    path: () => self._repo.path
  }
}
