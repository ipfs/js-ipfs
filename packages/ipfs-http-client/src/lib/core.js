'use strict'
/* eslint-env browser */
const Multiaddr = require('multiaddr')
const toUri = require('multiaddr-to-uri')
const { isBrowser, isWebWorker } = require('ipfs-utils/src/env')
const { URL } = require('iso-url')
const HTTP = require('./api')

const isMultiaddr = (input) => {
  try {
    Multiaddr(input) // eslint-disable-line no-new
    return true
  } catch (e) {
    return false
  }
}

const normalizeURL = (options = {}) => {
  if (typeof options === 'string') {
    options = { url: options }
  }

  if (Multiaddr.isMultiaddr(options) || isMultiaddr(options)) {
    options = { url: toUri(options) }
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
      // log(data)
      msg = data.Message || data.message
    } else {
      msg = await response.text()
    }
  } catch (err) {
    // log('Failed to parse error response', err)
    // Failed to extract/parse error message from response
    msg = err.message
  }

  const error = new HTTP.HTTPError(response)

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

/**
 * @typedef {Object} APIOptions - creates a new type named 'SpecialType'
 * @prop {string} [host] - Request body
 * @prop {number} [port] - GET, POST, PUT, DELETE, etc.
 * @prop {string} [protocol] - The base URL to use in case url is a relative URL
 * @prop {Headers|Record<string, string>} [headers] - Request header.
 * @prop {number|string} [timeout] - Amount of time until request should timeout in ms or humand readable. @see https://www.npmjs.com/package/parse-duration for valid string values.
 * @prop {string} [apiPath] - Path to the API.
 */

class API {
  /**
   *
   * @param {APIOptions|URL|Multiaddr|string} options
   */
  constructor (options = {}) {
    this.http = new HTTP({
      timeout: options.timeout || 60000 * 20,
      signal: options.signal,
      headers: options.headers,
      base: normalizeURL(options).toString(),
      handleError: errorHandler,
      // apply two mutations camelCase to kebad-case and remove undefined/null key/value pairs
      // everything else either is a bug or validation is needed
      transformSearchParams: (search) => {
        const out = new URLSearchParams()

        // @ts-ignore https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
        for (const [key, value] of search) {
          if (
            value !== 'undefined' &&
            value !== 'null' &&
            key !== 'signal' &&
            key !== 'timeout'
          ) {
            out.append(kebabCase(key), value)
          }
        }

        // console.log('ipfsClient -> out', out)
        return out
      }
    })
  }
}
