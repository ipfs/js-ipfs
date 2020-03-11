'use strict'

const CID = require('cids')
const merge = require('merge-options')
const { toFormData } = require('./form-data')
const toCamel = require('../lib/object-to-camel')
const configure = require('../lib/configure')

module.exports = configure((api) => {
  return async function * add (input, options = {}) {
    const progressFn = options.progress
    options = merge(
      options,
      {
        'stream-channels': true,
        progress: Boolean(progressFn),
        hash: options.hashAlg // TODO fix this either is hash or hashAlg
      }
    )

    const res = await api.ndjson('add', {
      method: 'POST',
      searchParams: options,
      body: await toFormData(input),
      timeout: options.timeout,
      signal: options.signal
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
