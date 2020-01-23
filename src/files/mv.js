'use strict'

const CID = require('cids')
const configure = require('../lib/configure')
const { findSources } = require('./utils')

module.exports = configure(({ ky }) => {
  return (...args) => {
    const { sources, options } = findSources(args)

    const searchParams = new URLSearchParams(options.searchParams)
    sources.forEach(src => searchParams.append('arg', CID.isCID(src) ? `/ipfs/${src}` : src))
    if (options.flush != null) searchParams.set('flush', options.flush)
    if (options.hashAlg) searchParams.set('hash', options.hashAlg)
    if (options.parents != null) searchParams.set('parents', options.parents)
    if (options.shardSplitThreshold != null) searchParams.set('shardSplitThreshold', options.shardSplitThreshold)

    return ky.post('files/mv', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    }).text()
  }
})
