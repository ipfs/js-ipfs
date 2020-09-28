'use strict'

const { withTimeoutOption } = require('../../utils')
const toCidAndPath = require('ipfs-core-utils/src/to-cid-and-path')

module.exports = ({ ipld, preload }) => {
  return withTimeoutOption(async function * tree (ipfsPath, options = {}) { // eslint-disable-line require-await
    const {
      cid,
      path
    } = toCidAndPath(ipfsPath)

    if (path) {
      options.path = path
    }

    if (options.preload !== false) {
      preload(cid)
    }

    yield * ipld.tree(cid, options.path, options)
  })
}
