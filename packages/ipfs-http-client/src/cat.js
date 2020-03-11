'use strict'

const CID = require('cids')
const { Buffer } = require('buffer')
const merge = require('merge-options')
const configure = require('./lib/configure')

module.exports = configure(api => {
  return async function * cat (path, options = {}) {
    options = merge(
      options,
      {
        arg: typeof path === 'string' ? path : new CID(path).toString()
      }
    )
    const res = await api.iterator('cat', {
      method: 'POST',
      timeout: options.timeout,
      signal: options.signal,
      searchParams: options
    })

    for await (const chunk of res) {
      yield Buffer.from(chunk)
    }
  }
})
