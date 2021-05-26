'use strict'

const configure = require('../lib/configure')

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/dag').API<HTTPClientExtraOptions>} DAGAPI
 */

module.exports = configure(api => {
  /**
   * @type {DAGAPI["tree"]}
   */
  const tree = async (ipfsPath, options = {}) => {
    throw new Error('Not implemented')
  }

  return tree
})
