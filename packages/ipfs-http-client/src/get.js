'use strict'

const configure = require('./lib/configure')
const Tar = require('it-tar')
const { Buffer } = require('buffer')
const CID = require('cids')
const toIterable = require('stream-to-it/source')

module.exports = configure(({ ky }) => {
  return async function * get (path, options) {
    options = options || {}

    const searchParams = new URLSearchParams()
    searchParams.set('arg', `${Buffer.isBuffer(path) ? new CID(path) : path}`)

    if (options.compress !== undefined) {
      searchParams.set('compress', options.compress)
    }

    if (options.compressionLevel !== undefined) {
      searchParams.set('compression-level', options.compressionLevel)
    }

    if (options.offset) {
      searchParams.set('offset', options.offset)
    }

    if (options.length) {
      searchParams.set('length', options.length)
    }

    const res = await ky.post('get', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    })

    const extractor = Tar.extract()

    for await (const { header, body } of extractor(toIterable(res.body))) {
      if (header.type === 'directory') {
        yield {
          path: header.name
        }
      } else {
        yield {
          path: header.name,
          content: body
        }
      }
    }
  }
})
