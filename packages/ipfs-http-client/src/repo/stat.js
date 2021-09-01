'use strict'

const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/repo').API<HTTPClientExtraOptions>} RepoAPI
 */

module.exports = configure(api => {
  /**
   * @type {RepoAPI["stat"]}
   */
  async function stat (options = {}) {
    const res = await api.post('repo/stat', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })
    const data = await res.json()

    return {
      numObjects: BigInt(data.NumObjects),
      repoSize: BigInt(data.RepoSize),
      repoPath: data.RepoPath,
      version: data.Version,
      storageMax: BigInt(data.StorageMax)
    }
  }
  return stat
})
