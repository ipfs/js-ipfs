'use strict'

const Tar = require('it-tar')
const CID = require('cids')
const toIterable = require('stream-to-it/source')

/** @typedef { import("./lib/api") } API */

module.exports = (/** @type {API} */ api) => {
  return async function * get (path, options = {}) {
    options.arg = `${Buffer.isBuffer(path) ? new CID(path) : path}`

    const res = await api.post('get', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: options
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
}
