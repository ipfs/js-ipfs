'use strict'

const toCamel = require('../lib/object-to-camel')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

module.exports = configure(api => {
  return async (key, value, options = {}) => {
    if (typeof key !== 'string') {
      throw new Error('Invalid key type')
    }

    const params = {
      arg: [
        key,
        value
      ],
      ...options
    }

    if (typeof value === 'boolean') {
      params.arg[1] = value.toString()
      params.bool = true
    } else if (typeof value !== 'string') {
      params.arg[1] = JSON.stringify(value)
      params.json = true
    }

    const res = await api.post('config', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams(params),
      headers: options.headers
    })

    return toCamel(await res.json())
  }
})
