'use strict'

const toFormData = require('../lib/buffer-to-form-data')
const modeToString = require('../lib/mode-to-string')
const mtimeToObject = require('../lib/mtime-to-object')
const configure = require('../lib/configure')

module.exports = configure(api => {
  return async (path, input, options = {}) => {
    const mtime = mtimeToObject(options.mtime)

    const searchParams = new URLSearchParams(options)
    searchParams.set('arg', path)
    searchParams.set('stream-channels', 'true')
    searchParams.set('hash', options.hashAlg)
    searchParams.set('hashAlg', null)
    if (mtime) {
      searchParams.set('mtime', mtime.secs)
      searchParams.set('mtimeNsecs', mtime.nsecs)
    }

    const res = await api.post('files/write', {
      timeout: options.timeout,
      signal: options.signal,
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
