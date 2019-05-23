'use strict'

const importer = require('ipfs-unixfs-importer')
const kindOf = require('kind-of')
const toAsyncIterator = require('pull-stream-to-async-iterator')
const toPullStream = require('async-iterator-to-pull-stream')
const pull = require('pull-stream/pull')
const pullValues = require('pull-stream/sources/values')
const pullMap = require('pull-stream/throughs/map')
const pullAsyncMap = require('pull-stream/throughs/async-map')
const pullFlatten = require('pull-stream/throughs/flatten')
const toPull = require('stream-to-pull-stream')
const waterfall = require('async/waterfall')
const isStream = require('is-stream')
const { isSource } = require('is-pull-stream')
const { parseChunkerString } = require('./utils')
const streamFromFileReader = require('ipfs-utils/src/streams/stream-from-filereader')
const { supportsFileReader } = require('ipfs-utils/src/supports')

function noop () {}

function prepareFile (file, self, opts, callback) {
  opts = opts || {}

  let cid = file.cid

  waterfall([
    (cb) => opts.onlyHash
      ? cb(null, file)
      : self.object.get(file.cid, Object.assign({}, opts, { preload: false }), cb),
    (node, cb) => {
      if (opts.cidVersion === 1) {
        cid = cid.toV1()
      }

      const b58Hash = cid.toBaseEncodedString()
      let size = node.size

      if (Buffer.isBuffer(node)) {
        size = node.length
      }

      cb(null, {
        path: file.path === undefined ? b58Hash : (file.path || ''),
        hash: b58Hash,
        // multihash: b58Hash,
        size
      })
    }
  ], callback)
}

function normalizeContent (content, opts) {
  if (!Array.isArray(content)) {
    content = [content]
  }

  return content.map((data) => {
    if (supportsFileReader && kindOf(data) === 'file') {
      data = { path: '', content: toPull.source(streamFromFileReader(data)) }
    }
    // Buffer input
    if (Buffer.isBuffer(data)) {
      data = { path: '', content: pullValues([data]) }
    }

    // Readable stream input
    if (isStream.readable(data)) {
      data = { path: '', content: toPull.source(data) }
    }

    if (isSource(data)) {
      data = { path: '', content: data }
    }

    if (data && data.content && typeof data.content !== 'function') {
      if (supportsFileReader && kindOf(data.content) === 'file') {
        data = { path: data.path, content: toPull.source(streamFromFileReader(data.content)) }
      }

      if (Buffer.isBuffer(data.content)) {
        data = { path: data.path, content: pullValues([data.content]) }
      }

      if (isStream.readable(data.content)) {
        data = { path: data.path, content: toPull.source(data.content) }
      }
    }

    if (opts.wrapWithDirectory && !data.path) {
      throw new Error('Must provide a path when wrapping with a directory')
    }

    return data
  })
}

function preloadFile (file, self, opts) {
  const isRootFile = !file.path || opts.wrapWithDirectory
    ? file.path === ''
    : !file.path.includes('/')

  const shouldPreload = isRootFile && !opts.onlyHash && opts.preload !== false

  if (shouldPreload) {
    self._preload(file.hash)
  }

  return file
}

function pinFile (file, self, opts, cb) {
  // Pin a file if it is the root dir of a recursive add or the single file
  // of a direct add.
  const pin = 'pin' in opts ? opts.pin : true
  const isRootDir = !file.path.includes('/')
  const shouldPin = pin && isRootDir && !opts.onlyHash && !opts.hashAlg
  if (shouldPin) {
    return self.pin.add(file.hash, { preload: false }, err => cb(err, file))
  } else {
    cb(null, file)
  }
}

module.exports = function (self) {
  // Internal add func that gets used by all add funcs
  return function addPullStream (options) {
    options = options || {}

    let chunkerOptions
    try {
      chunkerOptions = parseChunkerString(options.chunker)
    } catch (err) {
      return pullMap(() => { throw err })
    }
    const opts = Object.assign({}, {
      shardSplitThreshold: self._options.EXPERIMENTAL.sharding
        ? 1000
        : Infinity
    }, options, {
      chunker: chunkerOptions.chunker,
      chunkerOptions: chunkerOptions.chunkerOptions
    })

    // CID v0 is for multihashes encoded with sha2-256
    if (opts.hashAlg && opts.cidVersion !== 1) {
      opts.cidVersion = 1
    }

    let total = 0

    const prog = opts.progress || noop
    const progress = (bytes) => {
      total += bytes
      prog(total)
    }

    opts.progress = progress
    return pull(
      pullMap(content => normalizeContent(content, opts)),
      pullFlatten(),
      pullMap(file => ({
        path: file.path ? file.path : undefined,
        content: file.content ? toAsyncIterator(file.content) : undefined
      })),
      toPullStream.transform(source => importer(source, self._ipld, opts)),
      pullAsyncMap((file, cb) => prepareFile(file, self, opts, cb)),
      pullMap(file => preloadFile(file, self, opts)),
      pullAsyncMap((file, cb) => pinFile(file, self, opts, cb))
    )
  }
}
