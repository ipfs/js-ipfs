'use strict'

const importer = require('ipfs-unixfs-importer')
const normaliseAddInput = require('ipfs-core-utils/src/files/normalise-input/index')
const { parseChunkerString } = require('./utils')
const { pipe } = require('it-pipe')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const mergeOptions = require('merge-options').bind({ ignoreUndefined: true })

/**
 * @param {Object} config
 * @param {import('..').Block} config.block
 * @param {import('..').GCLock} config.gcLock
 * @param {import('..').Preload} config.preload
 * @param {import('..').Pin} config.pin
 * @param {ShardingOptions} [config.options]
 */
module.exports = ({ block, gcLock, preload, pin, options }) => {
  const isShardingEnabled = options && options.sharding
  /**
   * Import multiple files and data into IPFS.
   *
   * @param {FileStream} source
   * @param {AddAllOptions & AbortOptions} [options]
   * @returns {AsyncIterable<UnixFSEntry>}
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

    const totals = {}

    if (opts.progress) {
      const prog = opts.progress

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

function transformFile (opts) {
  return async function * (source) {
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
}

function preloadFile (preload, opts) {
  return async function * (source) {
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
        await pin.add(file.cid, {
          preload: false,
          lock: false
        })
      }

      yield file
    }
  }
}

/**
 * @typedef {object} UnixFSEntry
 * @property {string} path
 * @property {CID} cid
 * @property {number} [mode]
 * @property {MTime} [mtime]
 * @property {number} size
 *
 * @typedef {Object} AddAllOptions
 * @property {string} [chunker='size-262144'] - Chunking algorithm used to build
 * ipfs DAGs.
 * @property {0|1} [cidVersion=0] - The CID version to use when storing the data.
 * @property {boolean} [enableShardingExperiment=false] - Allows to create
 * directories with an unlimited number of entries currently size of unixfs
 * directories is limited by the maximum block size. **Note** that this is an
 * experimental feature.
 * @property {string} [hashAlg='sha2-256'] - Multihash hashing algorithm to use.
 * @property {boolean} [onlyHash=false] - If true, will not add blocks to the
 * blockstore.
 * @property {boolean} [pin=true] - Pin this object when adding.
 * @property {(bytes:number, path:string) => void} [progress] - a function that will be called with the number of bytes added as a file is added to ipfs and the path of the file being added
 * @property {boolean} [rawLeaves=false] - If true, DAG leaves will contain raw
 * file data and not be wrapped in a protobuf.
 * @property {number} [shardSplitThreshold=1000] - Directories with more than this
 * number of files will be created as HAMT-sharded directories.
 * @property {boolean} [trickle=false] - If true will use the
 * [trickle DAG](https://godoc.org/github.com/ipsn/go-ipfs/gxlibs/github.com/ipfs/go-unixfs/importer/trickle)
 * format for DAG generation.
 * @property {boolean} [wrapWithDirectory=false] - Adds a wrapping node around
 * the content.
 *
 * @typedef {import('ipfs-core-utils/src/files/normalise-input/normalise-input').Source} FileStream
 * @typedef {import('../../utils').MTime} MTime
 * @typedef {import('../../utils').AbortOptions} AbortOptions
 * @typedef {import('..').CID} CID
 *
 * @typedef {Object} ShardingOptions
 * @property {boolean} [sharding]
 */
