/* eslint-env browser */
'use strict'

const debug = require('debug')

const log = debug('ipfs:preload')
log.error = debug('ipfs:preload:error')

module.exports = function preload (url, callback) {
  log(url)

  const controller = new AbortController()
  const signal = controller.signal

  fetch(url, { signal })
    .then(res => {
      if (!res.ok) {
        log.error('failed to preload', url, res.status, res.statusText)
        throw new Error(`failed to preload ${url}`)
      }
      return res.text()
    })
    .then(() => callback())
    .catch(callback)

  return {
    cancel: () => controller.abort()
  }
}
