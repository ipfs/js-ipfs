'use strict'

const addAll = require('./add-all')
const last = require('it-last')
const configure = require('../lib/configure')

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/pin').API<HTTPClientExtraOptions>} PinAPI
 */

/**
 * @param {import('../types').Options} config
 */
module.exports = (config) => {
  const all = addAll(config)

  return configure(() => {
    /**
     * @type {PinAPI["add"]}
     */
    async function add (path, options = {}) {
      // @ts-ignore last can return undefined
      return last(all([{
        path,
        ...options
      }], options))
    }
    return add
  })(config)
}
