/* eslint-env browser */
'use strict'

const { default: PQueue } = require('p-queue')
const { default: ky } = require('ky-universal')
const debug = require('debug')

const log = debug('ipfs:preload')
log.error = debug('ipfs:preload:error')

// browsers limit concurrent connections per host,
// we don't want preload calls to exhaust the limit (~6)
const httpQueue = new PQueue({ concurrency: 4 })

module.exports = function preload (url, options) {
  log(url)
  options = options || {}

  return httpQueue.add(async () => {
    const res = await ky.get(url, { signal: options.signal })
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
