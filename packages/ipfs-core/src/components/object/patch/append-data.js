'use strict'

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const { concat: uint8ArrayConcat } = require('@vascosantos/uint8arrays/concat')

/**
 * @param {Object} config
 * @param {import('ipfs-repo').IPFSRepo} config.repo
 * @param {import('../../../types').Preload} config.preload
 */
module.exports = ({ repo, preload }) => {
  const get = require('../get')({ repo, preload })
  const put = require('../put')({ repo, preload })

  /**
   * @type {import('ipfs-core-types/src/object/patch').API["appendData"]}
   */
  async function appendData (cid, data, options = {}) {
    const node = await get(cid, options)
    const newData = uint8ArrayConcat([node.Data || [], data])

    return put({
      ...node,
      Data: newData
    }, options)
  }

  return withTimeoutOption(appendData)
}
