'use strict'

const CID = require('cids')
const { findSources } = require('./utils')
const configure = require('../lib/configure')

module.exports = configure(api => {
  return async (...args) => {
    const { sources, options } = findSources(args)

    const searchParams = new URLSearchParams(options)
    sources.forEach(src => searchParams.append('arg', CID.isCID(src) ? `/ipfs/${src}` : src))
    if (options.hashAlg) searchParams.set('hash', options.hashAlg)

    const res = await api.post('files/cp', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams
    })
    return res.text()
  }
})
