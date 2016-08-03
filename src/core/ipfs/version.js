'use strict'

const readPkgUp = require('read-pkg-up')

module.exports = function version (self) {
  return (opts, callback) => {
    if (typeof opts === 'function') {
      callback = opts
      opts = {}
    }

    readPkgUp()
      .then((res) => {
        callback(null, res.pkg.version)
      })
      .catch(callback)
  }
}
