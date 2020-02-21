'use strict'

const Big = require('bignumber.js')
const configure = require('../lib/configure')

module.exports = configure(({ ky }) => {
  return async options => {
    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)
    if (options.sizeOnly) searchParams.set('size-only', options.sizeOnly)

    const res = await ky.post('repo/stat', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    }).json()

    return {
      numObjects: new Big(res.NumObjects),
      repoSize: new Big(res.RepoSize),
      repoPath: res.RepoPath,
      version: res.Version,
      storageMax: new Big(res.StorageMax)
    }
  }
})
