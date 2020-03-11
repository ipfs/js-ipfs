'use strict'

/** @typedef { import("./../lib/api") } API */

module.exports = (/** @type {API} */ api) => {
  return async (name, password, options = {}) => {
    if (typeof password !== 'string') {
      options = password || {}
      password = null
    }

    options.arg = name
    options.password = password

    const res = await api.post('key/export', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: options
    })

    return res.text()
  }
}
