'use strict'

const kebabToCamel = require('./kebab-to-camel')
const coerce = require('coercer')

module.exports = (object) => {
  const output = {}

  Object.keys(object).forEach(key => {
    output[kebabToCamel(key)] = object[key]
  })

  return coerce(output)
}
