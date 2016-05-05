'use strict'

const utils = require('../utils')

module.exports = function repo (self) {
  return {
    init: (bits, empty, callback) => {
      // 1. check if repo already exists
    },

    version: (opts, callback) => {
      if (typeof opts === 'function') {
        callback = opts
        opts = {}
      }

      utils.ifRepoExists(self._repo, (err, res) => {
        if (err) {
          return callback(err)
        }

        self._repo.version.get(callback)
      })
    },

    gc: function () {},

    path: () => self._repo.path
  }
}
