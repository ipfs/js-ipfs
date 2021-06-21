'use strict'
/* eslint-env browser */
const { Multiaddr } = require('multiaddr')
const { isBrowser, isWebWorker, isNode } = require('ipfs-utils/src/env')
const { default: parseDuration } = require('parse-duration')
const log = require('debug')('ipfs-http-client:lib:error-handler')
const HTTP = require('ipfs-utils/src/http')
const merge = require('merge-options')
const toUrlString = require('ipfs-core-utils/src/to-url-string')
const http = require('http')
const https = require('https')

const DEFAULT_PROTOCOL = isBrowser || isWebWorker ? location.protocol : 'http'
const DEFAULT_HOST = isBrowser || isWebWorker ? location.hostname : 'localhost'
const DEFAULT_PORT = isBrowser || isWebWorker ? location.port : '5001'

/**
 * @typedef {import('ipfs-utils/src/types').HTTPOptions} HTTPOptions
 * @typedef {import('../types').Options} Options
 */

/**
 * @param {Options|URL|Multiaddr|string} [options]
 * @returns {Options}
 */
const normalizeOptions = (options = {}) => {
  let url
  /** @type {Options} */
  let opts = {}
  let agent

  if (typeof options === 'string' || Multiaddr.isMultiaddr(options)) {
    url = new URL(toUrlString(options))
  } else if (options instanceof URL) {
    url = options
  } else if (typeof options.url === 'string' || Multiaddr.isMultiaddr(options.url)) {
    url = new URL(toUrlString(options.url))
    opts = options
  } else if (options.url instanceof URL) {
    url = options.url
    opts = options
  } else {
    opts = options || {}

    const protocol = (opts.protocol || DEFAULT_PROTOCOL).replace(':', '')
    const host = (opts.host || DEFAULT_HOST).split(':')[0]
    const port = (opts.port || DEFAULT_PORT)

    url = new URL(`${protocol}://${host}:${port}`)
  }

  if (opts.apiPath) {
    url.pathname = opts.apiPath
  } else if (url.pathname === '/' || url.pathname === undefined) {
    url.pathname = 'api/v0'
  }

  if (isNode) {
    const Agent = url.protocol.startsWith('https') ? https.Agent : http.Agent

    agent = opts.agent || new Agent({
      keepAlive: true,
      // Similar to browsers which limit connections to six per host
      maxSockets: 6
    })
  }

  return {
    ...opts,
    host: url.host,
    protocol: url.protocol.replace(':', ''),
    port: Number(url.port),
    apiPath: url.pathname,
    url,
    agent
  }
}

/**
 * @param {Response} response
 */
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

  /** @type {Error} */
  let error = new HTTP.HTTPError(response)

  // This is what go-ipfs returns where there's a timeout
  if (msg && msg.includes('context deadline exceeded')) {
    error = new HTTP.TimeoutError('Request timed out')
  }

  // This also gets returned
  if (msg && msg.includes('request timed out')) {
    error = new HTTP.TimeoutError('Request timed out')
  }

  // If we managed to extract a message from the response, use it
  if (msg) {
    error.message = msg
  }

  throw error
}

const KEBAB_REGEX = /[A-Z\u00C0-\u00D6\u00D8-\u00DE]/g

/**
 * @param {string} str
 */
const kebabCase = (str) => {
  return str.replace(KEBAB_REGEX, function (match) {
    return '-' + match.toLowerCase()
  })
}

/**
 * @param {string | number} value
 */
const parseTimeout = (value) => {
  return typeof value === 'string' ? parseDuration(value) : value
}

class Client extends HTTP {
  /**
   * @param {Options|URL|Multiaddr|string} [options]
   */
  constructor (options = {}) {
    const opts = normalizeOptions(options)

    super({
      timeout: parseTimeout(opts.timeout || 0) || 60000 * 20,
      headers: opts.headers,
      base: `${opts.url}`,
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

          // @ts-ignore server timeouts are strings
          if (key === 'timeout' && !isNaN(value)) {
            out.append(kebabCase(key), value)
          }
        }

        return out
      },
      // @ts-ignore this can be a https agent or a http agent
      agent: opts.agent
    })

    // @ts-ignore - cannot delete no-optional fields
    delete this.get
    // @ts-ignore - cannot delete no-optional fields
    delete this.put
    // @ts-ignore - cannot delete no-optional fields
    delete this.delete
    // @ts-ignore - cannot delete no-optional fields
    delete this.options

    const fetch = this.fetch

    /**
     * @param {string | Request} resource
     * @param {HTTPOptions} options
     */
    this.fetch = (resource, options = {}) => {
      if (typeof resource === 'string' && !resource.startsWith('/')) {
        resource = `${opts.url}/${resource}`
      }

      return fetch.call(this, resource, merge(options, {
        method: 'POST'
      }))
    }
  }
}

Client.errorHandler = errorHandler

module.exports = Client
