'use strict'

const last = require('it-last')

module.exports = ({ addAll }) => {
  return async function add (source, options) { // eslint-disable-line require-await
    return last(addAll(source, options))
  }
}
