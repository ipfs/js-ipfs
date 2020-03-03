/* eslint-disable no-undef */
'use strict'

const fetch = require('./fetch')
const merge = require('merge-options')
const { URL, URLSearchParams } = require('iso-url')
const global = require('ipfs-utils/src/globalthis')
const Request = global.Request
const AbortController = global.AbortController

class TimeoutError extends Error {
  constructor () {
    super('Request timed out')
    this.name = 'TimeoutError'
  }
}

class HTTPError extends Error {
  constructor (response) {
    super(response.statusText)
    this.name = 'HTTPError'
    this.response = response
  }
}

const timeout = (promise, ms, abortController) => {
  if (ms === undefined) {
    return promise
  }

  return new Promise((resolve, reject) => {
    const timeoutID = setTimeout(() => {
      reject(new TimeoutError())

      if (AbortController) {
        abortController.abort()
      }
    }, ms)

    promise
      .then(resolve)
      .catch(reject)
      .then(() => {
        clearTimeout(timeoutID)
      })
  })
}

const defaults = {
  throwHttpErrors: true,
  credentials: 'same-origin',
  transformSearchParams: p => p
}

class API {
  constructor (options = {}) {
    this.options = merge(defaults, options)

    // connect internal abort to external
    if (AbortController) {
      this.abortController = new AbortController()
      if (this.options.signal) {
        this.options.signal.addEventListener('abort', () => {
          this.abortController.abort()
        })
      }

      this.options.signal = this.abortController.signal
    }
  }

  async fetch (resource, options = {}) {
    const opts = merge(this.options, options)

    // validate resource type
    if (typeof resource !== 'string' && !(resource instanceof URL || resource instanceof Request)) {
      throw new TypeError('`resource` must be a string, URL, or Request')
    }

    // validate resource format and normalize with prefixUrl
    if (opts.base && typeof opts.base === 'string' && typeof resource === 'string') {
      if (resource.startsWith('/')) {
        throw new Error('`resource` must not begin with a slash when using `base`')
      }

      if (!opts.base.endsWith('/')) {
        opts.base += '/'
      }

      resource = opts.base + resource
    }

    // TODO: try to remove the logic above or fix URL instance input without trailing '/'
    const url = new URL(resource, opts.base)
    url.search = new URLSearchParams(opts.transformSearchParams(new URLSearchParams(opts.searchParams)))

    const response = await timeout(fetch(url, opts), opts.timeout, this.abortController)

    if (!response.ok && opts.throwHttpErrors) {
      if (opts.handleError) {
        return opts.handleError(response)
      }
      throw new HTTPError(response)
    }
    return response
  }

  post (resource, options = {}) {
    return this.fetch(resource, merge(options, { method: 'POST' }))
  }

  get (resource, options = {}) {
    return this.fetch(resource, merge(options, { method: 'GET' }))
  }

  put (resource, options = {}) {
    return this.fetch(resource, merge(options, { method: 'PUT' }))
  }

  delete (resource, options = {}) {
    return this.fetch(resource, merge(options, { method: 'DELETE' }))
  }

  options (resource, options = {}) {
    return this.fetch(resource, merge(options, { method: 'OPTIONS' }))
  }
}

API.HTTPError = HTTPError
API.TimeoutError = TimeoutError
module.exports = API
