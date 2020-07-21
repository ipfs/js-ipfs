'use strict'

const last = require('it-last')

module.exports = ({ rmAll }) => {
  return async function rm (path, options) { // eslint-disable-line require-await
    return last(rmAll({
      path,
      ...options
    }, options))
  }
}
