'use strict'

const HTTP = require('ipfs-utils/src/http')
const debug = require('debug')

const log = Object.assign(debug('ipfs:preload'), {
  error: debug('ipfs:preload:error')
})

/**
 * @param {string} url
 * @param {import('ipfs-core-types/src/utils').AbortOptions} options
 */
module.exports = async function preload (url, options = {}) {
  log(url)

  const res = await HTTP.post(url, { signal: options.signal })

  // @ts-ignore
  for await (const _ of res.body) { // eslint-disable-line no-unused-vars
    // Read to completion but do not cache
  }
}
