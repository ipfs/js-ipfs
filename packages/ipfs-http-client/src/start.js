'use strict'

const configure = require('./lib/configure')
const errCode = require('err-code')

/**
 * @typedef {import('./types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/root').API<HTTPClientExtraOptions>} RootAPI
 */

module.exports = configure(api => {
  /**
   * @type {RootAPI["start"]}
   */
  const start = async (options = {}) => {
    throw errCode(new Error('Not implemented'), 'ERR_NOT_IMPLEMENTED')
  }

  return start
})
