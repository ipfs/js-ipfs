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

    const result = await stat(context)(path, options)

    return result.cid
  }
}
