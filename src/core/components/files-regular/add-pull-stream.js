'use strict'

const importer = require('ipfs-unixfs-importer')
const pull = require('pull-stream')
const toPull = require('stream-to-pull-stream')
const waterfall = require('async/waterfall')
const isStream = require('is-stream')
const isSource = require('is-pull-stream').isSource
const CID = require('cids')
const { parseChunkerString } = require('./utils')

const WRAPPER = 'wrapper/'

function noop () {}

function prepareFile (file, self, opts, callback) {
  opts = opts || {}

  let cid = new CID(file.multihash)

  if (opts.cidVersion === 1) {
    cid = cid.toV1()
  }

  waterfall([
    (cb) => opts.onlyHash
      ? cb(null, file)
      : self.object.get(file.multihash, Object.assign({}, opts, { preload: false }), cb),
    (node, cb) => {
      const b58Hash = cid.toBaseEncodedString()

      let size = node.size

      if (Buffer.isBuffer(node)) {
        size = node.length
      }

      cb(null, {
        path: opts.wrapWithDirectory
          ? file.path.substring(WRAPPER.length)
          : (file.path || b58Hash),
        hash: b58Hash,
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
    // Buffer input
    if (Buffer.isBuffer(data)) {
      data = { path: '', content: pull.values([data]) }
    }

    // Readable stream input
    if (isStream.readable(data)) {
      data = { path: '', content: toPull.source(data) }
    }

    if (isSource(data)) {
      data = { path: '', content: data }
    }

    if (data && data.content && typeof data.content !== 'function') {
      if (Buffer.isBuffer(data.content)) {
        data.content = pull.values([data.content])
      }

      if (isStream.readable(data.content)) {
        data.content = toPull.source(data.content)
      }
    }

    if (opts.wrapWithDirectory && !data.path) {
      throw new Error('Must provide a path when wrapping with a directory')
    }

    if (opts.wrapWithDirectory) {
      data.path = WRAPPER + data.path
    }

    return data
  })
}

function preloadFile (file, self, opts) {
  const isRootFile = opts.wrapWithDirectory
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
      return pull.map(() => { throw err })
    }
    const opts = Object.assign({}, {
      shardSplitThreshold: self._options.EXPERIMENTAL.sharding
        ? 1000
        : Infinity
    }, options, chunkerOptions)

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
      pull.map(content => normalizeContent(content, opts)),
      pull.flatten(),
      importer(self._ipld, opts),
      pull.asyncMap((file, cb) => prepareFile(file, self, opts, cb)),
      pull.map(file => preloadFile(file, self, opts)),
      pull.asyncMap((file, cb) => pinFile(file, self, opts, cb))
    )
  }
}
