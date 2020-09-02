'use strict'

const Tar = require('it-tar')
const CID = require('cids')
const configure = require('./lib/configure')
const toUrlSearchParams = require('./lib/to-url-search-params')
const map = require('it-map')

module.exports = configure(api => {
  return async function * get (path, options = {}) {
    const res = await api.post('get', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: `${path instanceof Uint8Array ? new CID(path) : path}`,
        ...options
      }),
      headers: options.headers
    })

    const extractor = Tar.extract()

    for await (const { header, body } of extractor(res.iterator())) {
      if (header.type === 'directory') {
        yield {
          path: header.name
        }
      } else {
        yield {
          path: header.name,
          content: map(body, (chunk) => chunk.slice()) // convert bl to Buffer/Uint8Array
        }
      }
    }
  }
})
