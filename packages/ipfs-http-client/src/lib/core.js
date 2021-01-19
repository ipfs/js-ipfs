'use strict'
/* eslint-env browser */
const Multiaddr = require('multiaddr')
const { isBrowser, isWebWorker, isNode } = require('ipfs-utils/src/env')
const parseDuration = require('parse-duration').default
const log = require('debug')('ipfs-http-client:lib:error-handler')
const HTTP = require('ipfs-utils/src/http')
const merge = require('merge-options')
const toUrlString = require('ipfs-core-utils/src/to-url-string')
const http = require('http')

const DEFAULT_PROTOCOL = isBrowser || isWebWorker ? location.protocol : 'http'
const DEFAULT_HOST = isBrowser || isWebWorker ? location.hostname : 'localhost'
const DEFAULT_PORT = isBrowser || isWebWorker ? location.port : '5001'

/**
 * @param {ClientOptions|URL|Multiaddr|string} [options]
 * @returns {ClientOptions}
 */
const normalizeOptions = (options = {}) => {
  let url
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
    agent = opts.agent || new http.Agent({
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

  // This also gets returned
  if (msg && msg.includes('request timed out')) {
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
 * @typedef {import('http').Agent} Agent
 *
 * @typedef {Object} ClientOptions
 * @property {string} [host]
 * @property {number} [port]
 * @property {string} [protocol]
 * @property {Headers|Record<string, string>} [headers] - Request headers.
 * @property {number|string} [timeout] - Amount of time until request should timeout in ms or humand readable. https://www.npmjs.com/package/parse-duration for valid string values.
 * @property {string} [apiPath] - Path to the API.
 * @property {URL|string|Multiaddr} [url] - Full API URL.
 * @property {object} [ipld]
 * @property {any[]} [ipld.formats] - An array of additional [IPLD formats](https://github.com/ipld/interface-ipld-format) to support
 * @property {(format: string) => Promise<any>} [ipld.loadFormat] - an async function that takes the name of an [IPLD format](https://github.com/ipld/interface-ipld-format) as a string and should return the implementation of that codec
 * @property {Agent | function(string):Agent} [agent] - A [http.Agent](https://nodejs.org/api/http.html#http_class_http_agent) or a function that returns an agent, used to control connection persistence and reuse for HTTP clients (only supported in node.js)
 */
class Client extends HTTP {
  /**
   * @param {ClientOptions|URL|Multiaddr|string} [options]
   */
  constructor (options = {}) {
    const opts = normalizeOptions(options)

    super({
      timeout: parseTimeout(opts.timeout) || 60000 * 20,
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

          // server timeouts are strings
          if (key === 'timeout' && !isNaN(value)) {
            out.append(kebabCase(key), value)
          }
        }

        return out
      },
      agent: opts.agent
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
