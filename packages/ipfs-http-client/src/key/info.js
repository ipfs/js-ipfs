'use strict'

const configure = require('../lib/configure')
const errCode = require('err-code')

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/key').API<HTTPClientExtraOptions>} KeyAPI
 */

module.exports = configure(api => {
  /**
   * @type {KeyAPI["info"]}
   */
  const info = async (name, options = {}) => {
    throw errCode(new Error('Not implemented'), 'ERR_NOT_IMPLEMENTED')
  }

  return info
})
