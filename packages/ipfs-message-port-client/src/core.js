'use strict'

/* eslint-env browser */

const CID = require('cids')
const { Client } = require('./client')
const { encodeCID, decodeCID } = require('ipfs-message-port-protocol/src/dag')
const {
  decodeAsyncIterable,
  encodeCallback
} = require('ipfs-message-port-protocol/src/core')

/**
 * @typedef {import('ipfs-message-port-protocol/src/dag').EncodedCID} EncodedCID
 *
 * @typedef {Object} NoramilzedFileInput
 * @property {string} path
 * @property {AsyncIterable<ArrayBuffer>} content
 *
 * @typedef {Int8Array|Uint8Array|Uint8ClampedArray|Int16Array|Int32Array|Uint32Array|Float32Array|Float64Array|BigInt64Array|BigUint64Array} TypedArray
 * @typedef {ArrayBuffer|ArrayBufferView} Bytes
 *
 * @typedef {Bytes|Blob|string|Iterable<number>|Iterable<Bytes>|AsyncIterable<Bytes>} FileContent
 * @typedef {Object} FileObject
 * @property {string} [path]
 * @property {FileContent} [content]
 * @property {string|number} [mode]
 * @property {UnixTime} [mtime]
 *
 * @typedef {Date|Time|[number, number]} UnixTime
 * @typedef {Bytes|Blob|string|FileObject|Iterable<number>|Iterable<Bytes>|Iterable<Blob>|Iterable<string>|Iterable<FileObject>|AsyncIterable<Bytes>|AsyncIterable<Blob>|AsyncIterable<string>|AsyncIterable<FileObject>} AnyFileInput
 *
 */
/** @type {(input:AnyFileInput) => AsyncIterable<NoramilzedFileInput>} */

/**
 * @typedef {import("./files").Time} Time
 *
 * @typedef {Object} AddOptions
 * @property {string} [chunker="size-262144"]
 * @property {number} [cidVersion=0]
 * @property {boolean} [enableShardingExperiment]
 * @property {string} [hashAlg="sha2-256"]
 * @property {boolean} [onlyHash=false]
 * @property {boolean} [pin=true]
 * @property {(added:number) => void} [progress]
 * @property {boolean} [rawLeaves=false]
 * @property {number} [shardSplitThreshold=1000]
 * @property {boolean} [trickle=false]
 * @property {boolean} [wrapWithDirectory=false]
 * @property {number} [timeout]
 * @property {AbortSignal} [signal]
 *
 * @typedef {Object} AddedData
 * @property {string} path
 * @property {CID} cid
 * @property {number} mode
 * @property {Time} mtime
 */

/**
 * @typedef {import('ipfs-message-port-server/src/core').Core} API
 * @typedef {import('ipfs-message-port-server/src/core').AddedEntry} AddedEntry
 * @typedef {import('./client').ClientTransport} Transport
 */

/**
 * @class
 * @extends {Client<API>}
 */
class CoreService extends Client {
  /**
   * @param {Transport} transport
   */
  constructor (transport) {
    super('core', ['add', 'cat'], transport)
  }

  /**
   * @param {AnyFileInput} input
   * @param {AddOptions} [options]
   * @returns {AsyncIterable<AddedData>}
   */
  async * add (input, options = {}) {
    const { timeout, signal } = options
    /** @type {Transferable[]} */
    const transfer = []
    const progress = options.progress
      ? encodeCallback(options.progress, transfer)
      : undefined

    if (input instanceof Blob) {
      const result = await this.remote.add({
        ...options,
        input,
        progress,
        transfer,
        timeout,
        signal
      })
      yield * decodeAsyncIterable(result.data, decodeAddedData)
    } else {
      throw Error('Input type is not supported')
    }
  }

  /**
   * @param {string|CID} inputPath
   * @param {Object} [options]
   * @param {number} [options.offset]
   * @param {number} [options.length]
   * @param {number} [options.timeout]
   * @param {AbortSignal} [options.signal]
   * @returns {AsyncIterable<Uint8Array>}
   */
  async * cat (inputPath, options = {}) {
    const input = CID.isCID(inputPath) ? encodeCID(inputPath) : inputPath
    const result = await this.remote.cat({ ...options, path: input })
    yield * decodeAsyncIterable(result.data, identity)
  }
}

/**
 *
 * @param {AddedEntry} data
 * @returns {AddedData}
 */
const decodeAddedData = ({ path, cid, mode, mtime }) => {
  return {
    path,
    cid: decodeCID(cid),
    mode,
    mtime
  }
}

/**
 * @template T
 * @param {T} v
 * @returns {T}
 */
const identity = v => v

module.exports = CoreService
