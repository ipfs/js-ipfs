'use strict'

const configure = require('../lib/configure')
const toCamel = require('../lib/object-to-camel')

module.exports = configure(({ ky }) => {
  return async (key, value, options) => {
    options = options || {}

    if (typeof key !== 'string') {
      throw new Error('Invalid key type')
    }

    const searchParams = new URLSearchParams(options.searchParams)

    if (typeof value === 'boolean') {
      searchParams.set('bool', true)
      value = value.toString()
    } else if (typeof value !== 'string') {
      searchParams.set('json', true)
      value = JSON.stringify(value)
    }

    searchParams.set('arg', key)
    searchParams.append('arg', value)

    const res = await ky.post('config', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    }).json()

    return toCamel(res)
  }
})
