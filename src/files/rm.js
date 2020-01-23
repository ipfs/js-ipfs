'use strict'

const configure = require('../lib/configure')

module.exports = configure(({ ky }) => {
  return (path, options) => {
    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)
    searchParams.append('arg', path)
    if (options.recursive != null) searchParams.set('recursive', options.recursive)
    if (options.force != null) searchParams.set('force', options.force)
    if (options.shardSplitThreshold != null) searchParams.set('shardSplitThreshold', options.shardSplitThreshold)

    return ky.post('files/rm', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    }).text()
  }
})
