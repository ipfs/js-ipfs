'use strict'
/* eslint-env browser */
const Multiaddr = require('multiaddr')
const toUri = require('multiaddr-to-uri')
const { isBrowser, isWebWorker } = require('ipfs-utils/src/env')
const { URL } = require('iso-url')
const parseDuration = require('parse-duration').default
const log = require('debug')('ipfs-http-client:lib:error-handler')
const HTTP = require('ipfs-utils/src/http')
const merge = require('merge-options')

const isMultiaddr = (input) => {
  try {
    Multiaddr(input) // eslint-disable-line no-new
    return true
  } catch (e) {
    return false
  }
}

const normalizeInput = (options = {}) => {
  if (isMultiaddr(options)) {
    options = { url: toUri(options) }
  } else if (typeof options === 'string') {
    options = { url: options }
  }

  const url = new URL(options.url)
  if (options.apiPath) {
    url.pathname = options.apiPath
  } else if (url.pathname === '/' || url.pathname === undefined) {
    url.pathname = 'api/v0'
  }
  if (!options.url) {
    if (isBrowser || isWebWorker) {
      url.protocol = options.protocol || location.protocol
      url.hostname = options.host || location.hostname
      url.port = options.port || location.port
    } else {
      url.hostname = options.host || 'localhost'
      url.port = options.port || '5001'
      url.protocol = options.protocol || 'http'
    }
  }
  options.url = url

  return options
}

const errorHandler = async (response) => {
  let msg

  try {
    if ((response.headers.get('Content-Type') || '').startsWith('application/json')) {
      const data = await response.json()
      log(data)
      msg = data.Message || data.message
    } else {
      msg = await response.text()
    }
  } catch (err) {
    log('Failed to parse error response', err)
    // Failed to extract/parse error message from response
    msg = err.message
  }

  let error = new HTTP.HTTPError(response)

  // This is what go-ipfs returns where there's a timeout
  if (msg && msg.includes('context deadline exceeded')) {
    error = new HTTP.TimeoutError(response)
  }

  // If we managed to extract a message from the response, use it
  if (msg) {
    error.message = msg
  }

  throw error
}

const KEBAB_REGEX = /[A-Z\u00C0-\u00D6\u00D8-\u00DE]/g
const kebabCase = (str) => {
  return str.replace(KEBAB_REGEX, function (match) {
    return '-' + match.toLowerCase()
  })
}

const parseTimeout = (value) => {
  return typeof value === 'string' ? parseDuration(value) : value
}

/**
 * @typedef {Object} ClientOptions
 * @prop {string} [host]
 * @prop {number} [port]
 * @prop {string} [protocol]
 * @prop {Headers|Record<string, string>} [headers] - Request headers.
 * @prop {number|string} [timeout] - Amount of time until request should timeout in ms or humand readable. https://www.npmjs.com/package/parse-duration for valid string values.
 * @prop {string} [apiPath] - Path to the API.
 * @prop {URL|string} [url] - Full API URL.
 */

class Client extends HTTP {
  /**
   *
   * @param {ClientOptions|URL|Multiaddr|string} options
   */
  constructor (options = {}) {
    /** @type {ClientOptions} */
    const opts = normalizeInput(options)
    super({
      timeout: parseTimeout(opts.timeout) || 60000 * 20,
      headers: opts.headers,
      base: normalizeInput(opts.url).toString(),
      handleError: errorHandler,
      transformSearchParams: (search) => {
        const out = new URLSearchParams()

        // @ts-ignore https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
        for (const [key, value] of search) {
          if (
            value !== 'undefined' &&
            value !== 'null' &&
            key !== 'signal'
          ) {
            out.append(kebabCase(key), value)
          }

          // server timeouts are strings
          if (key === 'timeout' && !isNaN(value)) {
            out.append(kebabCase(key), value)
          }
        }

        return out
      }
    })

    delete this.get
    delete this.put
    delete this.delete
    delete this.options

    const fetch = this.fetch

    this.fetch = (resource, options = {}) => {
      return fetch.call(this, resource, merge(options, {
        method: 'POST'
      }))
    }
  }
}

Client.errorHandler = errorHandler

module.exports = Client
