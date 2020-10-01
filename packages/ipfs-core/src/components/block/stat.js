'use strict'

const { cleanCid } = require('./utils')
const { withTimeoutOption } = require('../../utils')

module.exports = ({ blockService, preload }) => {
  return withTimeoutOption(async function stat (cid, options) {
    options = options || {}
    cid = cleanCid(cid)

    if (options.preload !== false) {
      preload(cid)
    }

    const block = await blockService.get(cid)

    return { cid, size: block.data.length }
  })
}
