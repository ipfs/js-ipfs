'use strict'

const CID = require('cids')
const { Buffer } = require('buffer')
// const configure = require('./lib/configure')
const toIterable = require('stream-to-it/source')
const merge = require('merge-options')

module.exports = api => {
  return async function * cat (path, options = {}, fetchOptions = {}) {
    options = merge(
      options,
      {
        arg: typeof path === 'string' ? path : new CID(path).toString()
      }
    )
    const res = await api.post('cat', {
      timeout: fetchOptions.timeout,
      signal: fetchOptions.signal,
      headers: fetchOptions.headers,
      searchParams: options
    })

    for await (const chunk of toIterable(res.body)) {
      yield Buffer.from(chunk)
    }
  }
}
