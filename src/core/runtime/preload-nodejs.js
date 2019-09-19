'use strict'

const http = require('http')
const https = require('https')
const { URL } = require('url')
const debug = require('debug')
const setImmediate = require('async/setImmediate')

const log = debug('ipfs:preload')
log.error = debug('ipfs:preload:error')

module.exports = function preload (url, callback = () => {}) {
  log(url)

  try {
    url = new URL(url)
  } catch (err) {
    return setImmediate(() => callback(err))
  }

  const transport = url.protocol === 'https:' ? https : http

  const req = transport.get({
    hostname: url.hostname,
    port: url.port,
    path: url.pathname + url.search
  }, (res) => {
    if (res.statusCode < 200 || res.statusCode >= 300) {
      res.resume()
      log.error('failed to preload', url.href, res.statusCode, res.statusMessage)
      return callback(new Error(`failed to preload ${url}`))
    }

    res.on('data', chunk => log(`data ${chunk}`))

    res.on('abort', () => {
      callback(new Error('request aborted'))
    })

    res.on('error', err => {
      log.error('response error preloading', url.href, err)
      callback(err)
    })

    res.on('end', () => {
      // If aborted, callback is called in the abort handler
      if (!res.aborted) callback()
    })
  })

  req.on('error', err => {
    log.error('request error preloading', url.href, err)
    callback(err)
  })

  return {
    cancel: () => {
      // No need to call callback here
      // before repsonse - called in req error handler
      // after response - called in res abort hander
      req.abort()
    }
  }
}
