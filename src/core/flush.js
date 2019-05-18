'use strict'

const applyDefaultOptions = require('./utils/apply-default-options')
const stat = require('./stat')
const {
  FILE_SEPARATOR
} = require('./utils/constants')

const defaultOptions = {}

module.exports = (context) => {
  return async function mfsFlush (path = FILE_SEPARATOR, options = defaultOptions) {
    options = applyDefaultOptions(options, defaultOptions)

    await stat(context)(path, options)
  }
}
