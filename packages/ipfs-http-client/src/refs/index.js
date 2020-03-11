'use strict'

const { Buffer } = require('buffer')
const CID = require('cids')
const toCamel = require('../lib/object-to-camel')

/** @typedef { import("./../lib/api") } API */

module.exports = (/** @type {API} */ api) => {
  const refs = (args, options = {}) => {
    const searchParams = new URLSearchParams(options)

    if (!Array.isArray(args)) {
      args = [args]
    }

    for (const arg of args) {
      searchParams.append('arg', `${Buffer.isBuffer(arg) ? new CID(arg) : arg}`)
    }

    return api.ndjson('refs', {
      method: 'POST',
      timeout: options.timeout,
      signal: options.signal,
      searchParams,
      transform: toCamel
    })
  }
  refs.local = require('./local')(api)

  return refs
}
