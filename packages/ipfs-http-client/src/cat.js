'use strict'

const CID = require('cids')
const { Buffer } = require('buffer')
const toIterable = require('stream-to-it/source')
const merge = require('merge-options')

module.exports = api => {
  return async function * cat (path, options = {}) {
    options = merge(
      options,
      {
        arg: typeof path === 'string' ? path : new CID(path).toString()
      }
    )
    const res = await api.post('cat', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: options
    })

    for await (const chunk of toIterable(res.body)) {
      yield Buffer.from(chunk)
    }
  }
}
