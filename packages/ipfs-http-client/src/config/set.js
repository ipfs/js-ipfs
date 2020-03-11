'use strict'

const toCamel = require('../lib/object-to-camel')
const configure = require('../lib/configure')

module.exports = configure(api => {
  return async (key, value, options = {}) => {
    if (typeof key !== 'string') {
      throw new Error('Invalid key type')
    }

    const searchParams = new URLSearchParams(options)

    if (typeof value === 'boolean') {
      searchParams.set('bool', 'true')
      value = value.toString()
    } else if (typeof value !== 'string') {
      searchParams.set('json', 'true')
      value = JSON.stringify(value)
    }

    searchParams.append('arg', key)
    searchParams.append('arg', value)

    const res = await api.post('config', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams
    })

    return toCamel(await res.json())
  }
})
