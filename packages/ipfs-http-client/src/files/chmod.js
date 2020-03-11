'use strict'

const modeToString = require('../lib/mode-to-string')
const configure = require('../lib/configure')

module.exports = configure(api => {
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
})
