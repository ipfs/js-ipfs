'use strict'

const { parseArgs } = require('./utils')
const { withTimeoutOption } = require('../../utils')

module.exports = ({ ipld, preload }) => {
  return withTimeoutOption(async function * resolve (cid, path, options) { // eslint-disable-line require-await
    [cid, path, options] = parseArgs(cid, path, options)

    if (options.preload !== false) {
      preload(cid)
    }

    yield * ipld.resolve(cid, path, { signal: options.signal })
  })
}
