'use strict'

const { Buffer } = require('buffer')
const toIterable = require('stream-to-it/source')
const configure = require('../lib/configure')

module.exports = configure(api => {
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
})
