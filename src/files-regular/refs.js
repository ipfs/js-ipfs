'use strict'

const configure = require('../lib/configure')
const cleanCID = require('../utils/clean-cid')
const IsIpfs = require('is-ipfs')
const ndjson = require('iterable-ndjson')
const toIterable = require('../lib/stream-to-iterable')
const toCamel = require('../lib/object-to-camel')

module.exports = configure(({ ky }) => {
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

    for (let arg of args) {
      try {
        arg = cleanCID(arg)
      } catch (err) {
        if (!IsIpfs.ipfsPath(arg)) {
          throw err
        }
      }

      searchParams.append('arg', arg.toString())
    }

    const res = await ky.get('refs', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    })

    for await (const file of ndjson(toIterable(res.body))) {
      yield toCamel(file)
    }
  }
})
