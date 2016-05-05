'use strict'

const utils = require('../utils')

module.exports = function version (self) {
  return (opts, callback) => {
    if (typeof opts === 'function') {
      callback = opts
      opts = {}
    }

    utils.ifRepoExists(self._repo, (err) => {
      if (err) {
        return callback(err)
      }

      self._repo.config.get((err, config) => {
        if (err) {
          return callback(err)
        }

        callback(null, config.Version.Current)
      })
    })
  }
}
