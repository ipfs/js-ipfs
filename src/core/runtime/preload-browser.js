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

module.exports = function preload (url, callback) {
  log(url)

  const controller = new AbortController()
  const signal = controller.signal
  const cb = () => setImmediate(callback) // https://github.com/ipfs/js-ipfs/pull/2304#discussion_r320700893

  httpQueue.add(() => ky.get(url, { signal })).then(cb, cb)

  return {
    cancel: () => controller.abort()
  }
}
