'use strict'

const promisify = require('promisify-es6')
const parseUrl = require('url').parse
const request = require('../utils/request')
const moduleConfig = require('../utils/module-config')
const SendOneFile = require('../utils/send-one-file-multiple-results')

module.exports = (arg) => {
  const sendOneFile = SendOneFile(moduleConfig(arg), 'add')

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

    requestWithRedirect(url, opts, sendOneFile, callback)
  })
}

const validUrl = (url) => typeof url === 'string' && url.startsWith('http')

const requestWithRedirect = (url, opts, sendOneFile, callback) => {
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
      requestWithRedirect(redirection, opts, sendOneFile, callback)
    } else {
      sendOneFile(res, { qs: opts }, callback)
    }
  }).end()
}
