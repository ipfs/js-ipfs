/* eslint-env browser */
'use strict'

const { default: PQueue } = require('p-queue')
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

  _httpQueue.add(() => fetch(url, { signal })
    .then(res => {
      if (!res.ok) {
        log.error('failed to preload', url, res.status, res.statusText)
        throw new Error(`failed to preload ${url}`)
      }
      return res.text()
    })
  ).then(() => callback(), callback)

  return {
    cancel: () => controller.abort()
  }
}
