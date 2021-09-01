'use strict'

const { CID } = require('multiformats/cid')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/files').API<HTTPClientExtraOptions>} FilesAPI
 */

module.exports = configure(api => {
  /**
   * @type {FilesAPI["flush"]}
   */
  async function flush (path, options = {}) {
    if (!path || typeof path !== 'string') {
      throw new Error('ipfs.files.flush requires a path')
    }

    const res = await api.post('files/flush', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: path,
        ...options
      }),
      headers: options.headers
    })
    const data = await res.json()

    return CID.parse(data.Cid)
  }
  return flush
})
