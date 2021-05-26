'use strict'

const CID = require('cids')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/files').API<HTTPClientExtraOptions>} FilesAPI
 */

module.exports = configure(api => {
  /**
   * @type {FilesAPI["mv"]}
   */
  async function mv (sources, destination, options = {}) {
    if (!Array.isArray(sources)) {
      sources = [sources]
    }

    const res = await api.post('files/mv', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: sources.concat(destination).map(src => CID.isCID(src) ? `/ipfs/${src}` : src),
        ...options
      }),
      headers: options.headers
    })
    await res.text()
  }

  return mv
})
