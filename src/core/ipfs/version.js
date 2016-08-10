'use strict'

const pkg = require('../../../package.json')

module.exports = function version (self) {
  return (opts, callback) => {
    if (typeof opts === 'function') {
      callback = opts
      opts = {}
    }

    callback(null, pkg.version)
  }
}
