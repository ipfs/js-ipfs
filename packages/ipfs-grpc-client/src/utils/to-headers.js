'use strict'

const { paramCase } = require('change-case')

/**
 * @param {Record<string, any>} [object] - key/value pairs to turn into HTTP headers
 */
module.exports = (object = {}) => {
  /** @type {Record<string, string>} */
  const output = {}

  Object.keys(object || {}).forEach(key => {
    if (typeof object[key] === 'function') {
      return
    }

    output[paramCase(key)] = object[key].toString()
  })

  return output
}
