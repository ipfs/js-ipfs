'use strict'

const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/config').API<HTTPClientExtraOptions>} ConfigAPI
 */

module.exports = configure(api => {
  /**
   * @type {ConfigAPI["set"]}
   */
  const set = async (key, value, options = {}) => {
    if (typeof key !== 'string') {
      throw new Error('Invalid key type')
    }

    const params = {
      ...options,
      ...encodeParam(key, value)
    }

    const res = await api.post('config', {
      signal: options.signal,
      searchParams: toUrlSearchParams(params),
      headers: options.headers
    })

    await res.text()
  }

  return set
})

/**
 * @param {*} key
 * @param {*} value
 */
const encodeParam = (key, value) => {
  switch (typeof value) {
    case 'boolean':
      return { arg: [key, value.toString()], bool: true }
    case 'string':
      return { arg: [key, value] }
    default:
      return { arg: [key, JSON.stringify(value)], json: true }
  }
}
