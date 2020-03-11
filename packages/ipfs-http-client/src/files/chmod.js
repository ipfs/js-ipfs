'use strict'

const modeToString = require('../lib/mode-to-string')

/** @typedef { import("./../lib/api") } API */

module.exports = (/** @type {API} */ api) => {
  return async function chmod (path, mode, options = {}) {
    options.arg = path
    options.mode = modeToString(mode)
    options.hash = options.hashAlg
    options.hashAlg = null

    const res = await api.post('files/chmod', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: options
    })

    return res.text()
  }
}
