'use strict'

const CID = require('cids')
const toCamelWithMetadata = require('../lib/object-to-camel-with-metadata')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/files').API<HTTPClientExtraOptions>} FilesAPI
 */

module.exports = configure(api => {
  /**
   * @type {FilesAPI["stat"]}
   */
  async function stat (path, options = {}) {
    if (path && !CID.isCID(path) && typeof path !== 'string') {
      options = path || {}
      path = '/'
    }

    const res = await api.post('files/stat', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: path,
        ...options
      }),
      headers: options.headers
    })
    const data = await res.json()

    data.WithLocality = data.WithLocality || false
    return toCoreInterface(toCamelWithMetadata(data))
  }
  return stat
})

/**
 * @param {*} entry
 */
function toCoreInterface (entry) {
  entry.cid = new CID(entry.hash)
  delete entry.hash
  return entry
}
