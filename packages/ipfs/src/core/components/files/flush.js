'use strict'

const applyDefaultOptions = require('./utils/apply-default-options')
const stat = require('./stat')
const { withTimeoutOption } = require('../../utils')

const defaultOptions = {}

module.exports = (context) => {
  return withTimeoutOption(async function mfsFlush (path = '/', options = defaultOptions) {
    if (path && typeof path !== 'string') {
      options = path
      path = '/'
    }

    options = applyDefaultOptions(options, defaultOptions)

    const result = await stat(context)(path, options)

    return result.cid
  })
}
