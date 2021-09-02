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
   * @type {FilesAPI["cp"]}
   */
  async function cp (sources, destination, options = {}) {
    /** @type {import('ipfs-core-types/src/utils').IPFSPath[]} */
    const sourceArr = Array.isArray(sources) ? sources : [sources]

    const res = await api.post('files/cp', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: sourceArr.concat(destination).map(src => CID.asCID(src) ? `/ipfs/${src}` : src),
        ...options
      }),
      headers: options.headers
    })

    await res.text()
  }
  return cp
})
