'use strict'

module.exports = function repo (self) {
  return {
    init: (bits, empty, callback) => {
      // 1. check if repo already exists
    },

    version: (callback) => {
      self._repo.version.get(callback)
    },

    gc: function () {},

    path: () => self._repo.path
  }
}
