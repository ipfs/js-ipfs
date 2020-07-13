'use strict'

const addAll = require('./add-all')
const last = require('it-last')
const configure = require('./lib/configure')

module.exports = (options) => {
  const all = addAll(options)

  return configure(() => {
    return async function add (input, options = {}) { // eslint-disable-line require-await
      return last(all(input, options))
    }
  })(options)
}
