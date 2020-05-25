'use strict'

const importer = require('ipfs-unixfs-importer')
const normaliseAddInput = require('ipfs-core-utils/src/files/normalise-input')
const { parseChunkerString } = require('./utils')
const pipe = require('it-pipe')
const { withTimeoutOption } = require('../../utils')

/**
 * @typedef {import('ipfs-interface').CID} CID
 * @typedef {import('ipfs-core-utils/src/files/normalise-input').Input} AddInput
 * @typedef {import('../init').PreloadService} PreloadService
 * @typedef {import('../init').Pin} Pin
 * @typedef {import('../init').GCLock} GCLock
 * @typedef {import('../init').Block} Block
 * @typedef {import('../init').ConstructorOptions} ConstructorOptions
 */
/**
 * @typedef {Object} AddOutput
 * @property {string} path
 * @property {CID} cid
 * @property {number} size
 * @property {Mode} mode
 * @property {Time} mtime
 *
 * @typedef {string} Mode
 * @typedef {Object} Time
 * @property {number} secs
 * @property {number} nsecs
 *
 * @param {Object} config
 * @param {Block} config.block
 * @param {GCLock} config.gcLock
 * @param {PreloadService} config.preload
 * @param {Pin} config.pin
 * @param {ConstructorOptions} config.options
 * @returns {Add}
 */
module.exports = ({ block, gcLock, preload, pin, options: constructorOptions }) => {
  const isShardingEnabled = constructorOptions.EXPERIMENTAL && constructorOptions.EXPERIMENTAL.sharding
  /**
   * @typedef {Object} AddOptions
   * @property {string} [chunker="size-262144"]
   * @property {number} [cidVersion=0]
   * @property {boolean} [enableShardingExperiment]
   * @property {string} [hashAlg="sha2-256"]
   * @property {boolean} [onlyHash=false]
   * @property {boolean} [pin=true]
   * @property {function(number):void} [progress]
   * @property {boolean} [rawLeaves=false]
   * @property {number} [shardSplitThreshold=1000]
   * @property {boolean} [trickle=false]
   * @property {boolean} [wrapWithDirectory=false]
   *
   * @callback Add
   * @param {AddInput} source
   * @param {AddOptions} [options]
   * @returns {AsyncIterable<AddOutput>}
   *
   * @type {Add}
   */
  async function * add (source, options) {
    options = options || {}

    /** @type {AddOptions & {shardSplitThreshold:number, strategy:'balanced'|'trickle', chunker:'fixed'|'rabin'}} */
    // @ts-ignore - chunker field of AddOptions and this are incompatible
    const opts = {
      shardSplitThreshold: isShardingEnabled ? 1000 : Infinity,
      ...options,
      strategy: 'balanced',
      ...parseChunkerString(options.chunker)
    }

    // CID v0 is for multihashes encoded with sha2-256
    if (opts.hashAlg && opts.hashAlg !== 'sha2-256' && opts.cidVersion !== 1) {
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
      yield * iterator
    } finally {
      releaseLock()
    }
  }

  return withTimeoutOption(add)
}

/**
 * @param {Object} opts
 * @param {number} [opts.cidVersion]
 * @param {boolean} [opts.wrapWithDirectory]
 * @returns {TransformFile}
 */
function transformFile (opts) {
  /**
   * @callback TransformFile
   * @param {AsyncIterable<?>} source
   * @returns {AsyncIterable<AddOutput>}
   * @type {TransformFile}
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
 * @param {PreloadService} preload
 * @param {Object} opts
 * @param {boolean} [opts.wrapWithDirectory]
 * @param {boolean} [opts.onlyHash]
 * @param {boolean} [opts.preload]
 * @returns {Preloader}
 */
function preloadFile (preload, opts) {
  /**
   * @callback Preloader
   * @param {AsyncIterable<AddOutput>} source
   * @returns {AsyncIterable<AddOutput>}
   * @type {Preloader}
   */
  async function * preloader (source) {
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

  return preloader
}

/**
 * @param {Pin} pin
 * @param {Object} opts
 * @param {boolean} [opts.pin]
 * @param {boolean} [opts.onlyHash]
 * @returns {Pinner}
 */
function pinFile (pin, opts) {
  /**
   * @callback Pinner
   * @param {AsyncIterable<AddOutput>} source
   * @returns {AsyncIterable<AddOutput>}
   * @type {Pinner}
   */
  async function * pinner (source) {
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

  return pinner
}
