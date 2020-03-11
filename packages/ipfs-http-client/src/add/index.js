'use strict'

const CID = require('cids')

const merge = require('merge-options')
const { toFormData } = require('./form-data')
const toCamel = require('../lib/object-to-camel')
const configure = require('../lib/configure')


module.exports = configure((api) => {
  return async function * add (input, options = {}) {
    console.log("Add called");
    console.log("Using monorepo version")
    const progressFn = options.progress
    options = merge(
      options,
      {
        'stream-channels': true,
        progress: Boolean(progressFn),
        hash: options.hashAlg // TODO fix this either is hash or hashAlg
      }
    )

    const formData = await toFormData(input)

    console.log({ formData })

    const res = await api.ndjson('add', {
      method: 'POST',
      searchParams: options,
      body: formData,
      timeout: options.timeout,
      signal: options.signal
    })

    for await (let file of res) {
      console.log({ file });
      file = toCamel(file)
      console.log("toCamelifiedFile", file);

      if (progressFn && file.bytes) {
        console.log("progressFn && file.bytes");
        progressFn(file.bytes)
      } else {
        console.log("else");
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
