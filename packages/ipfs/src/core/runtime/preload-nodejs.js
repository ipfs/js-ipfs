'use strict'
// @ts-ignore
const HTTP = require('ipfs-utils/src/http')
const debug = require('../debug')

const log = debug('ipfs:preload')

/**
 * @typedef {Object} PreloadOptions
 * @property {AbortSignal} [signal]
 *
 * @param {string} url
 * @param {PreloadOptions} [options]
 */
module.exports = async function preload (url, options) {
  log(url)
  options = options || {}

  // @ts-ignore - signal options isn't documented.
  const res = await HTTP.get(url, { signal: options.signal })

  for await (const _ of res.body) { // eslint-disable-line no-unused-vars
    // Read to completion but do not cache
  }
}
