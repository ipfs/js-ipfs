'use strict'

const { withTimeoutOption } = require('../../utils')
const first = require('it-first')
const last = require('it-last')
const toCidAndPath = require('ipfs-core-utils/src/to-cid-and-path')

module.exports = ({ ipld, preload }) => {
  return withTimeoutOption(async function get (ipfsPath, options = {}) {
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

    if (options.path) {
      if (options.localResolve) {
        return first(ipld.resolve(cid, options.path))
      }

      return last(ipld.resolve(cid, options.path))
    }

    return {
      value: await ipld.get(cid, options),
      remainderPath: ''
    }
  })
}
