'use strict'

const configure = require('../lib/configure')
const modeToString = require('../lib/mode-to-string')
const mtimeToObject = require('../lib/mtime-to-object')

module.exports = configure(({ ky }) => {
  return (path, options) => {
    options = options || {}
    const mtime = mtimeToObject(options.mtime)

    const searchParams = new URLSearchParams(options.searchParams)
    searchParams.append('arg', path)
    if (options.cidVersion != null) searchParams.set('cid-version', options.cidVersion)
    if (options.flush != null) searchParams.set('flush', options.flush)
    if (options.hashAlg) searchParams.set('hash', options.hashAlg)
    if (options.parents != null) searchParams.set('parents', options.parents)
    if (options.shardSplitThreshold != null) searchParams.set('shardSplitThreshold', options.shardSplitThreshold)
    if (mtime) {
      searchParams.set('mtime', mtime.secs)

      if (mtime.nsecs != null) {
        searchParams.set('mtimeNsecs', mtime.nsecs)
      }
    }
    if (options.mode != null) searchParams.set('mode', modeToString(options.mode))

    return ky.post('files/mkdir', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    }).text()
  }
})
