'use strict'

const ndjson = require('iterable-ndjson')
const CID = require('cids')
const configure = require('../lib/configure')
const toIterable = require('stream-to-it/source')
const { toFormData } = require('./form-data')
const toCamel = require('../lib/object-to-camel')

module.exports = configure(({ ky }) => {
  return async function * add (input, options) {
    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)

    searchParams.set('stream-channels', true)
    if (options.chunker) searchParams.set('chunker', options.chunker)
    if (options.cidVersion) searchParams.set('cid-version', options.cidVersion)
    if (options.cidBase) searchParams.set('cid-base', options.cidBase)
    if (options.enableShardingExperiment != null) searchParams.set('enable-sharding-experiment', options.enableShardingExperiment)
    if (options.hashAlg) searchParams.set('hash', options.hashAlg)
    if (options.onlyHash != null) searchParams.set('only-hash', options.onlyHash)
    if (options.pin != null) searchParams.set('pin', options.pin)
    if (options.progress) searchParams.set('progress', true)
    if (options.quiet != null) searchParams.set('quiet', options.quiet)
    if (options.quieter != null) searchParams.set('quieter', options.quieter)
    if (options.rawLeaves != null) searchParams.set('raw-leaves', options.rawLeaves)
    if (options.shardSplitThreshold) searchParams.set('shard-split-threshold', options.shardSplitThreshold)
    if (options.silent) searchParams.set('silent', options.silent)
    if (options.trickle != null) searchParams.set('trickle', options.trickle)
    if (options.wrapWithDirectory != null) searchParams.set('wrap-with-directory', options.wrapWithDirectory)
    if (options.preload != null) searchParams.set('preload', options.preload)
    if (options.fileImportConcurrency != null) searchParams.set('file-import-concurrency', options.fileImportConcurrency)
    if (options.blockWriteConcurrency != null) searchParams.set('block-write-concurrency', options.blockWriteConcurrency)

    const res = await ky.post('add', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams,
      body: await toFormData(input)
    })

    for await (let file of ndjson(toIterable(res.body))) {
      file = toCamel(file)

      if (options.progress && file.bytes) {
        options.progress(file.bytes)
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
