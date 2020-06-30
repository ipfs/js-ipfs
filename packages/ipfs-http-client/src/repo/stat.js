'use strict'

const { BigNumber } = require('bignumber.js')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

module.exports = configure(api => {
  return async (options = {}) => {
    const res = await api.post('repo/stat', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })
    const data = await res.json()

    return {
      numObjects: new BigNumber(data.NumObjects),
      repoSize: new BigNumber(data.RepoSize),
      repoPath: data.RepoPath,
      version: data.Version,
      storageMax: new BigNumber(data.StorageMax)
    }
  }
})
