'use strict'

const { cleanCid } = require('./utils')
const { withTimeoutOption } = require('../../utils')

module.exports = ({ blockService, preload }) => {
  return withTimeoutOption(async function get (cid, options) { // eslint-disable-line require-await
    options = options || {}
    cid = cleanCid(cid)

    if (options.preload !== false) {
      preload(cid)
    }

    return blockService.get(cid, options)
  })
}
