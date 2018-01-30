'use strict'

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
    version: (callback) => {
      self._repo._isInitialized(err => {
        if (err) {
          if (/ENOENT|not yet initialized/.test(err.message)) {
            // this repo has not been initialized
            return callback(null, repoVersion)
          }
          return callback(err)
        }

        self._repo.version.get(callback)
      })
    },

    gc: function () {},

    path: () => self._repo.path
  }
}
