/* eslint-env browser */
'use strict'

const { default: PQueue } = require('p-queue')
const HTTP = require('ipfs-utils/src/http')
const debug = require('../debug')

const log = debug('ipfs:preload')

// browsers limit concurrent connections per host,
// we don't want preload calls to exhaust the limit (~6)
const httpQueue = new PQueue({ concurrency: 4 })

/**
 * @param {string} url
 * @param {Object} [options]
 * @param {AbortSignal} [options.signal]
 * @returns {Promise<void>}
 */
module.exports = function preload (url, options) {
  log(url)
  const { signal } = options || {}

  return httpQueue.add(async () => {
    const res = await HTTP.get(url, { signal })
    // @ts-ignore - `res.body` could be null
    const reader = res.body.getReader()

    try {
      while (true) {
        const { done } = await reader.read()
        if (done) return
        // Read to completion but do not cache
      }
    } finally {
      reader.releaseLock()
    }
  })
}
