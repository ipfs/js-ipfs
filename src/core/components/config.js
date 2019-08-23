'use strict'

const callbackify = require('callbackify')

module.exports = function config (self) {
  return {
    get: callbackify(self._repo.config.get),
    set: callbackify(self._repo.config.set),
    replace: callbackify(self._repo.config.set)
  }
}
