'use strict'

const promisify = require('promisify-es6')
const once = require('once')
const parseUrl = require('url').parse
const request = require('../utils/request')
const DAGNodeStream = require('../utils/dagnode-stream')
const moduleConfig = require('../utils/module-config')

module.exports = (arg) => {
  const send = moduleConfig(arg)

  return promisify((url, opts, callback) => {
    if (typeof (opts) === 'function' &&
        callback === undefined) {
      callback = opts
      opts = {}
    }

    // opts is the real callback --
    // 'callback' is being injected by promisify
    if (typeof opts === 'function' &&
        typeof callback === 'function') {
      callback = opts
      opts = {}
    }

    if (!validUrl(url)) {
      return callback(new Error('"url" param must be an http(s) url'))
    }

    callback = once(callback)

    requestWithRedirect(url, opts, send, callback)
  })
}

const validUrl = (url) => typeof url === 'string' && url.startsWith('http')

const requestWithRedirect = (url, opts, send, callback) => {
  request(parseUrl(url).protocol)(url, (res) => {
    res.once('error', callback)
    if (res.statusCode >= 400) {
      return callback(new Error(`Failed to download with ${res.statusCode}`))
    }

    const redirection = res.headers.location

    if (res.statusCode >= 300 && res.statusCode < 400 && redirection) {
      if (!validUrl(redirection)) {
        return callback(new Error('redirection url must be an http(s) url'))
      }
      requestWithRedirect(redirection, opts, send, callback)
    } else {
      const params = {
        path: 'add',
        qs: opts,
        files: res
      }
      // Transform the response stream to DAGNode values
      const transform = (res, callback) => DAGNodeStream.streamToValue(send, res, callback)
      send.andTransform(params, transform, callback)
    }
  }).end()
}
