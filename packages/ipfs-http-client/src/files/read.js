'use strict'

const { Buffer } = require('buffer')
const toIterable = require('stream-to-it/source')

/** @typedef { import("./../lib/api") } API */

module.exports = (/** @type {API} */ api) => {
  return async function * read (path, options = {}) {
    options.arg = path
    const res = await api.post('files/read', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: options
    })

    for await (const chunk of toIterable(res.body)) {
      yield Buffer.from(chunk)
    }
  }
}
