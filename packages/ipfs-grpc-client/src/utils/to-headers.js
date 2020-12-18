'use strict'

const { paramCase } = require('change-case')

/**
 * @param {object} [object] - key/value pairs to turn into HTTP headers
 * @returns {object} - HTTP headers
 **/
module.exports = (object) => {
  const output = {}

  Object.keys(object || {}).forEach(key => {
    if (typeof object[key] === 'function') {
      return
    }

    output[paramCase(key)] = object[key]
  })

  return output
}
