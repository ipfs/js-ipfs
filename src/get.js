'use strict'

const configure = require('./lib/configure')
const Tar = require('it-tar')
const IsIpfs = require('is-ipfs')
const toIterable = require('./lib/stream-to-iterable')
const cleanCID = require('./utils/clean-cid')

module.exports = configure(({ ky }) => {
  return async function * get (path, options) {
    options = options || {}

    try {
      path = cleanCID(path)
    } catch (err) {
      if (!IsIpfs.ipfsPath(path)) {
        throw err
      }
    }

    const searchParams = new URLSearchParams()
    searchParams.set('arg', path.toString())

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

    const res = await ky.get('get', {
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
