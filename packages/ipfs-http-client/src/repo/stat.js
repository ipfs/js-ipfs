'use strict'

const { BigNumber } = require('bignumber.js')
const configure = require('../lib/configure')

module.exports = configure(api => {
  return async (options = {}) => {
    const res = await (await api.post('repo/stat', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: options
    })).json()

    return {
      numObjects: new BigNumber(res.NumObjects),
      repoSize: new BigNumber(res.RepoSize),
      repoPath: res.RepoPath,
      version: res.Version,
      storageMax: new BigNumber(res.StorageMax)
    }
  }
})
