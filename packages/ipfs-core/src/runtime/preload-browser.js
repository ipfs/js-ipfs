/* eslint-env browser */
'use strict'

const { default: PQueue } = require('p-queue')
const HTTP = require('ipfs-utils/src/http')
const debug = require('debug')

const log = Object.assign(debug('ipfs:preload'), {
  error: debug('ipfs:preload:error')
})

// browsers limit concurrent connections per host,
// we don't want preload calls to exhaust the limit (~6)
const httpQueue = new PQueue({ concurrency: 4 })

/**
 * @param {string} url
 * @param {import('ipfs-core-types/src/utils').AbortOptions} options
 */
module.exports = function preload (url, options = {}) {
  log(url)

  return httpQueue.add(async () => {
    const res = await HTTP.post(url, { signal: options.signal })

    // @ts-ignore
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
