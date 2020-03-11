'use strict'

/** @typedef { import("./../lib/api") } API */

module.exports = (/** @type {API} */ api) => {
  return async (key, options = {}) => {
    if (key && typeof key === 'object') {
      options = key
      key = null
    }

    const url = key ? 'config' : 'config/show'
    const rsp = await api.post(url, {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: { arg: key }
    })
    const data = await rsp.json()

    return key ? data.Value : data
  }
}
