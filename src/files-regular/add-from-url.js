'use strict'

const promisify = require('promisify-es6')
const parseUrl = require('url').parse
const request = require('../utils/request')
const SendOneFile = require('../utils/send-one-file-multiple-results')
const FileResultStreamConverter = require('../utils/file-result-stream-converter')

module.exports = (send) => {
  const sendOneFile = SendOneFile(send, 'add')

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
  const parsedUrl = parseUrl(url)

  const req = request(parsedUrl.protocol)(url, (res) => {
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
      const requestOpts = {
        qs: opts,
        converter: FileResultStreamConverter
      }
      const fileName = decodeURIComponent(parsedUrl.pathname.split('/').pop())

      sendOneFile({
        content: res,
        path: fileName
      }, requestOpts, callback)
    }
  })

  req.once('error', callback)

  req.end()
}
