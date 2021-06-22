'use strict'

const { importer } = require('ipfs-unixfs-importer')
const normaliseAddInput = require('ipfs-core-utils/src/files/normalise-input/index')
const { parseChunkerString } = require('./utils')
const { pipe } = require('it-pipe')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const mergeOptions = require('merge-options').bind({ ignoreUndefined: true })

/**
 * @typedef {import('cids')} CID
 * @typedef {import('ipfs-unixfs-importer').ImportResult} ImportResult
 */

/**
 * @typedef {Object} Context
 * @property {import('ipfs-core-types/src/block').API} block
 * @property {import('../gc-lock').GCLock} gcLock
 * @property {import('../../types').Preload} preload
 * @property {import('ipfs-core-types/src/pin').API} pin
 * @property {import('ipfs-core-types/src/root').ShardingOptions} [options]
 *
 * @param {Context} context
 */
module.exports = ({ block, gcLock, preload, pin, options }) => {
  const isShardingEnabled = options && options.sharding

  /**
   * @type {import('ipfs-core-types/src/root').API["addAll"]}
   */
  async function * addAll (source, options = {}) {
    const opts = mergeOptions({
      shardSplitThreshold: isShardingEnabled ? 1000 : Infinity,
      strategy: 'balanced'
    }, options, {
      ...parseChunkerString(options.chunker)
    })

    // CID v0 is for multihashes encoded with sha2-256
    if (opts.hashAlg && opts.hashAlg !== 'sha2-256' && opts.cidVersion !== 1) {
      opts.cidVersion = 1
    }

    if (opts.trickle) {
      opts.strategy = 'trickle'
    }

    if (opts.strategy === 'trickle') {
      opts.leafType = 'raw'
      opts.reduceSingleLeafToSelf = false
    }

    if (opts.cidVersion > 0 && opts.rawLeaves === undefined) {
      // if the cid version is 1 or above, use raw leaves as this is
      // what go does.
      opts.rawLeaves = true
    }

    if (opts.hashAlg !== undefined && opts.rawLeaves === undefined) {
      // if a non-default hash alg has been specified, use raw leaves as this is
      // what go does.
      opts.rawLeaves = true
    }

    delete opts.trickle

    /** @type {Record<string, number>} */
    const totals = {}

    if (opts.progress) {
      const prog = opts.progress

      /**
       * @param {number} bytes
       * @param {string} path
       */
      opts.progress = (bytes, path) => {
        if (!totals[path]) {
          totals[path] = 0
        }

        totals[path] += bytes

        prog(totals[path], path)
      }
    }

    const iterator = pipe(
      normaliseAddInput(source),
      /**
       * @param {AsyncIterable<import('ipfs-unixfs-importer').ImportCandidate>} source
       */
      source => importer(source, block, {
        ...opts,
        pin: false
      }),
      transformFile(opts),
      preloadFile(preload, opts),
      pinFile(pin, opts)
    )

    const releaseLock = await gcLock.readLock()

    try {
      for await (const added of iterator) {
        // do not keep file totals around forever
        delete totals[added.path]

        yield added
      }
    } finally {
      releaseLock()
    }
  }

  return withTimeoutOption(addAll)
}

/**
 * @param {import('ipfs-core-types/src/root').AddAllOptions} opts
 */
function transformFile (opts) {
  /**
   * @param {AsyncGenerator<ImportResult, void, undefined>} source
   */
  async function * transformFile (source) {
    for await (const file of source) {
      let cid = file.cid

      if (opts.cidVersion === 1) {
        cid = cid.toV1()
      }

      let path = file.path ? file.path : cid.toString()

      if (opts.wrapWithDirectory && !file.path) {
        path = ''
      }

      yield {
        path,
        cid,
        size: file.size,
        mode: file.unixfs && file.unixfs.mode,
        mtime: file.unixfs && file.unixfs.mtime
      }
    }
  }

  return transformFile
}

/**
 * @param {(cid: CID) => void} preload
 * @param {import('ipfs-core-types/src/root').AddAllOptions} opts
 */
function preloadFile (preload, opts) {
  /**
   * @param {AsyncGenerator<ImportResult, void, undefined>} source
   */
  async function * maybePreloadFile (source) {
    for await (const file of source) {
      const isRootFile = !file.path || opts.wrapWithDirectory
        ? file.path === ''
        : !file.path.includes('/')

      const shouldPreload = isRootFile && !opts.onlyHash && opts.preload !== false

      if (shouldPreload) {
        preload(file.cid)
      }

      yield file
    }
  }

  return maybePreloadFile
}

/**
 * @param {import('ipfs-core-types/src/pin').API} pin
 * @param {import('ipfs-core-types/src/root').AddAllOptions} opts
 */
function pinFile (pin, opts) {
  /**
   * @param {AsyncGenerator<ImportResult, void, undefined>} source
   */
  async function * maybePinFile (source) {
    for await (const file of source) {
      // Pin a file if it is the root dir of a recursive add or the single file
      // of a direct add.
      const isRootDir = !(file.path && file.path.includes('/'))
      const shouldPin = (opts.pin == null ? true : opts.pin) && isRootDir && !opts.onlyHash

      if (shouldPin) {
        // Note: addAsyncIterator() has already taken a GC lock, so tell
        // pin.add() not to take a (second) GC lock
        await pin.add(file.cid, {
          preload: false,
          lock: false
        })
      }

      yield file
    }
  }

  return maybePinFile
}
