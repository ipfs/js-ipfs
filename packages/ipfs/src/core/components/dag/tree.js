'use strict'

const { parseArgs } = require('./utils')

module.exports = ({ ipld, preload }) => {
  return async function * tree (cid, path, options) { // eslint-disable-line require-await
    [cid, path, options] = parseArgs(cid, path, options)

    if (options.preload !== false) {
      preload(cid)
    }

    yield * ipld.tree(cid, path, options)
  }
}
