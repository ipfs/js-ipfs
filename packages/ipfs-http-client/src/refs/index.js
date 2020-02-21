'use strict'

const configure = require('../lib/configure')
const { Buffer } = require('buffer')
const CID = require('cids')
const ndjson = require('iterable-ndjson')
const toIterable = require('stream-to-it/source')
const toCamel = require('../lib/object-to-camel')

module.exports = config => {
  const refs = (configure(({ ky }) => {
    return async function * refs (args, options) {
      options = options || {}

      const searchParams = new URLSearchParams()

      if (options.format !== undefined) {
        searchParams.set('format', options.format)
      }

      if (options.edges !== undefined) {
        searchParams.set('edges', options.edges)
      }

      if (options.unique !== undefined) {
        searchParams.set('unique', options.unique)
      }

      if (options.recursive !== undefined) {
        searchParams.set('recursive', options.recursive)
      }

      if (options.maxDepth !== undefined) {
        searchParams.set('max-depth', options.maxDepth)
      }

      if (!Array.isArray(args)) {
        args = [args]
      }

      for (const arg of args) {
        searchParams.append('arg', `${Buffer.isBuffer(arg) ? new CID(arg) : arg}`)
      }

      const res = await ky.post('refs', {
        timeout: options.timeout,
        signal: options.signal,
        headers: options.headers,
        searchParams
      })

      for await (const file of ndjson(toIterable(res.body))) {
        yield toCamel(file)
      }
    }
  }))(config)

  refs.local = require('./local')(config)

  return refs
}
