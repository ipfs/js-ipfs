'use strict'

const importer = require('ipfs-unixfs-importer')
const normaliseAddInput = require('ipfs-utils/src/files/normalise-input')
const { parseChunkerString } = require('./utils')
const pipe = require('it-pipe')
const log = require('debug')('ipfs:add')
log.error = require('debug')('ipfs:add:error')

function noop () {}

module.exports = function (self) {
  // Internal add func that gets used by all add funcs
  return async function * addAsyncIterator (source, options) {
    options = options || {}

    const chunkerOptions = parseChunkerString(options.chunker)

    const opts = Object.assign({}, {
      shardSplitThreshold: self._options.EXPERIMENTAL.sharding
        ? 1000
        : Infinity
    }, options, {
      strategy: 'balanced',
      chunker: chunkerOptions.chunker,
      chunkerOptions: chunkerOptions.chunkerOptions
    })

    // CID v0 is for multihashes encoded with sha2-256
    if (opts.hashAlg && opts.cidVersion !== 1) {
      opts.cidVersion = 1
    }

    if (opts.trickle) {
      opts.strategy = 'trickle'
    }

    delete opts.trickle

    let total = 0

    const prog = opts.progress || noop
    const progress = (bytes) => {
      total += bytes
      prog(total)
    }

    opts.progress = progress

    const iterator = pipe(
      normaliseAddInput(source),
      doImport(self, opts),
      transformFile(self, opts),
      preloadFile(self, opts),
      pinFile(self, opts)
    )

    const releaseLock = await self._gcLock.readLock()

    try {
      yield * iterator
    } finally {
      releaseLock()
    }
  }
}

function doImport (ipfs, opts) {
  return async function * (source) { // eslint-disable-line require-await
    yield * importer(source, ipfs._ipld, opts)
  }
}

function transformFile (ipfs, opts) {
  return async function * (source) {
    for await (const file of source) {
      let cid = file.cid
      const hash = cid.toBaseEncodedString()
      let path = file.path ? file.path : hash

      if (opts.wrapWithDirectory && !file.path) {
        path = ''
      }

      if (opts.onlyHash) {
        yield {
          path,
          hash,
          size: file.unixfs.fileSize()
        }

        return
      }

      const node = await ipfs.object.get(file.cid, Object.assign({}, opts, { preload: false }))

      if (opts.cidVersion === 1) {
        cid = cid.toV1()
      }

      let size = node.size

      if (Buffer.isBuffer(node)) {
        size = node.length
      }

      yield {
        path,
        hash,
        size
      }
    }
  }
}

function preloadFile (ipfs, opts) {
  return async function * (source) {
    for await (const file of source) {
      const isRootFile = !file.path || opts.wrapWithDirectory
        ? file.path === ''
        : !file.path.includes('/')

      const shouldPreload = isRootFile && !opts.onlyHash && opts.preload !== false

      if (shouldPreload) {
        ipfs._preload(file.hash)
      }

      yield file
    }
  }
}

function pinFile (ipfs, opts) {
  return async function * (source) {
    for await (const file of source) {
      // Pin a file if it is the root dir of a recursive add or the single file
      // of a direct add.
      const pin = 'pin' in opts ? opts.pin : true
      const isRootDir = !file.path.includes('/')
      const shouldPin = pin && isRootDir && !opts.onlyHash && !opts.hashAlg

      if (shouldPin) {
        // Note: addAsyncIterator() has already taken a GC lock, so tell
        // pin.add() not to take a (second) GC lock
        await ipfs.pin.add(file.hash, {
          preload: false,
          lock: false
        })
      }

      yield file
    }
  }
}
