'use strict'

module.exports = function config (self) {
  return {
    // cli only feature built with show and replace
    // edit: (callback) => {},
    replace: (config, callback) => {
      self._repo.config.set(config, callback)
    },
    show: (callback) => {
      self._repo.config.get(callback)
    }
  }
}
