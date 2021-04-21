'use strict'

// @ts-ignore no types
const Tar = require('it-tar')
const CID = require('cids')
const configure = require('./lib/configure')
const toUrlSearchParams = require('./lib/to-url-search-params')
const map = require('it-map')

/**
 * @typedef {import('./types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/root').API<HTTPClientExtraOptions>} RootAPI
 */

module.exports = configure(api => {
  /**
   * @type {RootAPI["get"]}
   */
  async function * get (path, options = {}) {
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
        // @ts-ignore - Missing the following properties from type 'Directory':
        // cid, name, size, depthts
        yield {
          type: 'dir',
          path: header.name
        }
      } else {
        // @ts-ignore - Missing the following properties from type 'File':
        // cid, name, size, depthts
        yield {
          type: 'file',
          path: header.name,
          content: map(body, (chunk) => chunk.slice()) // convert bl to Buffer/Uint8Array
        }
      }
    }
  }

  return get
})
