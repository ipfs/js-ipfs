'use strict'

const CID = require('cids')
const toCamel = require('./lib/object-to-camel')
const configure = require('./lib/configure')
const multipartRequest = require('./lib/multipart-request')
const toUrlSearchParams = require('./lib/to-url-search-params')

module.exports = configure((api) => {
  return async function * add (input, options = {}) {
    const progressFn = options.progress

    const res = await api.ndjson('add', {
      method: 'POST',
      searchParams: toUrlSearchParams(null, {
        ...options,
        'stream-channels': true,
        progress: Boolean(progressFn)
      }),
      timeout: options.timeout,
      signal: options.signal,
      ...(
        await multipartRequest(input)
      )
    })

    for await (let file of res) {
      file = toCamel(file)

      if (progressFn && file.bytes) {
        progressFn(file.bytes)
      } else {
        yield toCoreInterface(file)
      }
    }
  }
})

function toCoreInterface ({ name, hash, size, mode, mtime, mtimeNsecs }) {
  const output = {
    path: name,
    cid: new CID(hash),
    size: parseInt(size)
  }

  if (mode != null) {
    output.mode = parseInt(mode, 8)
  }

  if (mtime != null) {
    output.mtime = {
      secs: mtime,
      nsecs: mtimeNsecs || 0
    }
  }

  return output
}
