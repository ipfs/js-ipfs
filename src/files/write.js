'use strict'

const configure = require('../lib/configure')
const toFormData = require('../lib/buffer-to-form-data')
const modeToString = require('../lib/mode-to-string')
const mtimeToObject = require('../lib/mtime-to-object')

module.exports = configure(({ ky }) => {
  return async (path, input, options) => {
    options = options || {}
    const mtime = mtimeToObject(options.mtime)

    const searchParams = new URLSearchParams(options.searchParams)
    searchParams.set('arg', path)
    searchParams.set('stream-channels', true)
    if (options.cidVersion) searchParams.set('cid-version', options.cidVersion)
    if (options.create != null) searchParams.set('create', options.create)
    if (options.hashAlg) searchParams.set('hash', options.hashAlg)
    if (options.length != null) searchParams.set('length', options.length)
    if (options.offset != null) searchParams.set('offset', options.offset)
    if (options.parents != null) searchParams.set('parents', options.parents)
    if (options.rawLeaves != null) searchParams.set('raw-leaves', options.rawLeaves)
    if (options.truncate != null) searchParams.set('truncate', options.truncate)
    if (options.shardSplitThreshold != null) searchParams.set('shardSplitThreshold', options.shardSplitThreshold)
    if (mtime) {
      searchParams.set('mtime', mtime.secs)

      if (mtime.nsecs != null) {
        searchParams.set('mtimeNsecs', mtime.nsecs)
      }
    }

    const res = await ky.post('files/write', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams,
      body: toFormData(input, {
        mode: options.mode != null ? modeToString(options.mode) : undefined,
        mtime: mtime ? mtime.secs : undefined,
        mtimeNsecs: mtime ? mtime.nsecs : undefined
      }) // TODO: support inputs other than buffer as per spec
    })

    return res.text()
  }
})
