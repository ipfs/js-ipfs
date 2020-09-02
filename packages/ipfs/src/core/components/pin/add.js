'use strict'

const last = require('it-last')

module.exports = ({ addAll }) => {
  return async function add (path, options) { // eslint-disable-line require-await
    return last(addAll({
      path,
      ...options
    }, options))
  }
}
