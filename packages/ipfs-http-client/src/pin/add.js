'use strict'

const addAll = require('./add-all')
const last = require('it-last')
const configure = require('../lib/configure')

module.exports = (options) => {
  const all = addAll(options)

  return configure(() => {
    return async function add (path, options = {}) { // eslint-disable-line require-await
      return last(all({
        path,
        ...options
      }, options))
    }
  })(options)
}
