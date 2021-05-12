'use strict'

const configure = require('./lib/configure')

/**
 * @typedef {import('./types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/root').API<HTTPClientExtraOptions>} RootAPI
 */

module.exports = configure(api => {
  /**
   * @type {RootAPI["start"]}
   */
  const start = async (options = {}) => {
    throw new Error('Not implemented')
  }

  return start
})
