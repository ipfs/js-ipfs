'use strict'

const http = require('http')
const { URL } = require('url')
const debug = require('debug')
const setImmediate = require('async/setImmediate')

const log = debug('jsipfs:preload')
log.error = debug('jsipfs:preload:error')

module.exports = function preload (url, callback) {
  log(url)

  try {
    url = new URL(url)
  } catch (err) {
    return setImmediate(() => callback(err))
  }

  const req = http.request({
    protocol: url.protocol,
    hostname: url.hostname,
    port: url.port,
    path: url.pathname,
    method: 'HEAD'
  }, (res) => {
    res.resume()

    if (res.statusCode < 200 || res.statusCode >= 300) {
      log.error('failed to preload', url, res.statusCode, res.statusMessage)
      return callback(new Error(`failed to preload ${url}`))
    }

    callback()
  })

  req.on('error', err => {
    log.error('error preloading', url, err)
    callback(err)
  })

  req.end()
}
