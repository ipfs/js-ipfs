/* eslint-env browser */
'use strict'

const { default: PQueue } = require('p-queue')
const { default: ky } = require('ky-universal')
const debug = require('debug')

const log = debug('ipfs:preload')
log.error = debug('ipfs:preload:error')

// browsers limit concurrent connections per host,
// we don't want preload calls to exhaust the limit (~6)
const _httpQueue = new PQueue({ concurrency: 4 })

module.exports = function preload (url, callback) {
  log(url)

  const controller = new AbortController()
  const signal = controller.signal

  _httpQueue.add(async () => {
    const res = await ky(url, { signal })
    if (!res.ok) {
      log.error('failed to preload', url, res.status, res.statusText)
      throw new Error(`failed to preload ${url}`)
    }
    setImmediate(callback)
  }).catch((err) => setImmediate(() => callback(err)))

  return {
    cancel: () => controller.abort()
  }
}
