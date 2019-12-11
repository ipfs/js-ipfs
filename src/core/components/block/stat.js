'use strict'

const { cleanCid } = require('./utils')

module.exports = ({ blockService, preload }) => {
  return async function stat (cid, options) {
    options = options || {}
    cid = cleanCid(cid)

    if (options.preload !== false) {
      preload(cid)
    }

    const block = await blockService.get(cid)

    return {
      key: cid.toString(),
      size: block.data.length
    }
  }
}
