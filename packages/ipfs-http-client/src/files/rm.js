'use strict'

const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/files').API<HTTPClientExtraOptions>} FilesAPI
 */

module.exports = configure(api => {
  /**
   * @type {FilesAPI["rm"]}
   */
  async function rm (path, options = {}) {
    const res = await api.post('files/rm', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: path,
        ...options
      }),
      headers: options.headers
    })

    await res.text()
  }
  return rm
})
