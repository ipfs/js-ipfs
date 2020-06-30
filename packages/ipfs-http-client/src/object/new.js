'use strict'

const CID = require('cids')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

module.exports = configure(api => {
  return async (template, options = {}) => {
    if (typeof template !== 'string') {
      options = template || {}
      template = null
    }

    const res = await api.post('object/new', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: template,
        ...options
      }),
      headers: options.headers
    })

    const { Hash } = await res.json()

    return new CID(Hash)
  }
})
