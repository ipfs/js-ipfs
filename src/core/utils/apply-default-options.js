'use strict'

const errCode = require('err-code')

module.exports = (options = {}, defaults) => {
  if (Array.isArray(options)) {
    options = options.filter(arg => typeof arg === 'object').pop() || {}
  }

  const output = {}

  for (const key in defaults) {
    if (options[key] !== null && options[key] !== undefined) {
      output[key] = options[key]
    } else {
      output[key] = defaults[key]
    }
  }

  const format = output.format || output.codec

  if (format && isNaN(format)) {
    output.format = format
    delete output.codec
  }

  // support legacy go arguments
  if (options.count !== undefined) {
    output.length = options.count
  }

  if (options.p !== undefined) {
    output.parents = options.p
  }

  if (options.l !== undefined) {
    output.long = options.l
  }

  if (!output.length && output.length !== 0) {
    output.length = Infinity
  }

  if (output.offset < 0) {
    throw errCode(new Error('cannot have negative write offset'), 'ERR_INVALID_PARAMS')
  }

  if (output.length < 0) {
    throw errCode(new Error('cannot have negative byte count'), 'ERR_INVALID_PARAMS')
  }

  return output
}
