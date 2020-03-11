'use strict'

const Tar = require('it-tar')
const { Buffer } = require('buffer')
const CID = require('cids')
const configure = require('./lib/configure')

module.exports = configure(api => {
  return async function * get (path, options = {}) {
    options.arg = `${Buffer.isBuffer(path) ? new CID(path) : path}`

    const res = await api.iterator('get', {
      method: 'POST',
      timeout: options.timeout,
      signal: options.signal,
      searchParams: options
    })

    const extractor = Tar.extract()

    for await (const { header, body } of extractor(res)) {
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
