'use strict'

const importer = require('ipfs-unixfs-importer')
const normaliseAddInput = require('ipfs-utils/src/files/normalise-input')
const { parseChunkerString } = require('./utils')
const pipe = require('it-pipe')

module.exports = ({ ipld, dag, gcLock, preload, pin, options: constructorOptions }) => {
  const isShardingEnabled = constructorOptions.EXPERIMENTAL && constructorOptions.EXPERIMENTAL.sharding
  return async function * add (source, options) {
    options = options || {}

    const opts = {
      shardSplitThreshold: isShardingEnabled ? 1000 : Infinity,
      ...options,
      strategy: 'balanced',
      ...parseChunkerString(options.chunker)
    }

    // CID v0 is for multihashes encoded with sha2-256
    if (opts.hashAlg && opts.cidVersion !== 1) {
      opts.cidVersion = 1
    }

    if (opts.trickle) {
      opts.strategy = 'trickle'
    }

    delete opts.trickle

    if (opts.progress) {
      let total = 0
      const prog = opts.progress

      opts.progress = (bytes) => {
        total += bytes
        prog(total)
      }
    }

    const iterator = pipe(
      normaliseAddInput(source),
      source => importer(source, ipld, opts),
      transformFile(dag, opts),
      preloadFile(preload, opts),
      pinFile(pin, opts)
    )

    const releaseLock = await gcLock.readLock()

    try {
      yield * iterator
    } finally {
      releaseLock()
    }
  }
}

function transformFile (dag, opts) {
  return async function * (source) {
    for await (const { cid, path, unixfs } of source) {
      if (opts.onlyHash) {
        yield {
          cid,
          path: path || cid.toString(),
          size: unixfs.fileSize()
        }

        continue
      }

      const { value: node } = await dag.get(cid, { ...opts, preload: false })

      yield {
        cid,
        path: path || cid.toString(),
        size: Buffer.isBuffer(node) ? node.length : node.size
      }
    }
  }
}

function preloadFile (preload, opts) {
  return async function * (source) {
    for await (const file of source) {
      const isRootFile = !file.path || opts.wrapWithDirectory
        ? file.path === ''
        : !file.path.includes('/')

      const shouldPreload = isRootFile && !opts.onlyHash && opts.preload !== false

      if (shouldPreload) {
        preload(file.hash)
      }

      yield file
    }
  }
}

function pinFile (pin, opts) {
  return async function * (source) {
    for await (const file of source) {
      // Pin a file if it is the root dir of a recursive add or the single file
      // of a direct add.
      const isRootDir = !file.path.includes('/')
      const shouldPin = (opts.pin == null ? true : opts.pin) && isRootDir && !opts.onlyHash

      if (shouldPin) {
        // Note: addAsyncIterator() has already taken a GC lock, so tell
        // pin.add() not to take a (second) GC lock
        await pin.add(file.hash, {
          preload: false,
          lock: false
        })
      }

      yield file
    }
  }
}
