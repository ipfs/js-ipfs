'use strict'

const pkg = require('../../../package.json')
const promisify = require('promisify-es6')

module.exports = function version (self) {
  return promisify((opts, callback) => {
    if (typeof opts === 'function') {
      callback = opts
      opts = {}
    }

    callback(null, {
      version: pkg.version,
      repo: '',
      commit: ''
    })
  })
}
