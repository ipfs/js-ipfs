'use strict'

const applyDefaultOptions = require('./utils/apply-default-options')
const stat = require('./stat')
const { withTimeoutOption } = require('../../utils')

const defaultOptions = {
  signal: undefined
}

module.exports = (context) => {
  return withTimeoutOption(async function mfsFlush (path, options = {}) {
    options = applyDefaultOptions(options, defaultOptions)

    const { cid } = await stat(context)(path, options)

    return cid
  })
}
