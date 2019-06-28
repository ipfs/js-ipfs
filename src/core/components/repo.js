'use strict'

const promisify = require('promisify-es6')
const repoVersion = require('ipfs-repo').repoVersion

module.exports = function repo (self) {
  return {
    init: (bits, empty, callback) => {
      // 1. check if repo already exists
    },

    /**
     * If the repo has been initialized, report the current version.
     * Otherwise report the version that would be initialized.
     *
     * @param {function(Error, Number)} [callback]
     * @returns {undefined}
     */
    version: promisify((callback) => {
      self._repo._isInitialized(err => {
        if (err) {
          // TODO: (dryajov) This is really hacky, there must be a better way
          const match = [
            /Key not found in database \[\/version\]/,
            /ENOENT/,
            /repo is not initialized yet/
          ].some((m) => {
            return m.test(err.message)
          })
          if (match) {
            // this repo has not been initialized
            return callback(null, repoVersion)
          }
          return callback(err)
        }

        self._repo.version.get(callback)
      })
    }),

    gc: promisify((options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }

      callback(new Error('Not implemented'))
    }),

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
