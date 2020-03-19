'use strict'

const applyDefaultOptions = require('./utils/apply-default-options')
const stat = require('./stat')

const defaultOptions = {}

module.exports = (context) => {
  return async function mfsFlush (path = '/', options = defaultOptions) {
    options = applyDefaultOptions(options, defaultOptions)

    const result = await stat(context)(path, options)

    return result.cid
  }
}
