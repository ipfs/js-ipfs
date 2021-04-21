'use strict'

const configure = require('../lib/configure')

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/key').API<HTTPClientExtraOptions>} KeyAPI
 */

module.exports = configure(api => {
  /**
   * @type {KeyAPI["export"]}
   */
  const exportKey = async (name, password, options = {}) => {
    throw new Error('Not implemented')
  }

  return exportKey
})
