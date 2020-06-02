'use strict'

const CID = require('cids')
const { AbortError } = require('./errors')
/**
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
// @ts-ignore
const normaliseInput = require('ipfs-core-utils/src/files/normalise-input')

/**
 * @typedef {import("./connection")} RPCConnection
 * @typedef {import("./connection").RPCRequestOptions} RPCRequestOptions
 * @typedef {import("./files").Time} Time
 *
 * @typedef {Object} AddOptions
 * @property {chunker} [string="size-262144"]
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
 *
 * @typedef {Object} AddedData
 * @property {string} path
 * @property {CID} cid
 * @property {number} mode
 * @property {Time} mtime
 *
 * @typedef {Object} EncodedAddedData
 * @property {string} path
 * @property {string} cid
 * @property {number} mode
 * @property {Time} mtime
 *
 * @typedef {Object} Cat
 * @property {number} [offset]
 * @property {number} [length]
 */

/**
 * @template T
 * @typedef {T & RPCRequestOptions} Options
 */

class FilesTopClient {
  /**
   *
   * @param {RPCConnection} connection
   */
  constructor (connection) {
    this.connection = connection
  }

  /**
   * @param {AnyFileInput} input
   * @param {Options<AddOptions>} [options]
   * @returns {AsyncIterable<AddedData>}
   */
  async * add (input, options = {}) {
    const { progress, timeout, signal } = options
    const entries = normaliseInput(input)

    for await (const { path, content } of entries) {
      for await (const chunk of content) {
        const chunks = await collect(content)
        /** @type EncodedAddedData */
        const data = await this.connection.call(
          'add',
          {
            path,
            content: chunks
          },
          {
            transfer: chunks,
            signal
          }
        )

        if (signal && signal.aborted) {
          throw new AbortError()
        }
        yield decode(data)
      }
    }
  }

  /**
   * @param {string|CID|ArrayBuffer} inputPath
   * @param {Options<Cat>} [options]
   * @returns {AsyncIterable<ArrayBuffer>}
   */
  async * cat (inputPath, options = {}) {
    const input = CID.isCID(inputPath) ? inputPath.toString() : inputPath
    const transfer = input instanceof ArrayBuffer ? [input] : []
    const { signal, timeout, offset, length } = options
    /** @type ArrayBuffer[] */
    const chunks = await this.connection.call(
      'cat',
      {
        input,
        offset,
        length
      },
      {
        signal,
        timeout,
        transfer
      }
    )
    yield * chunks
  }
}

/**
 * @template T
 * @param {AsyncIterable<T>} content
 * @returns {Promise<T[]>}
 */
const collect = async content => {
  const chunks = []
  for await (const chunk of content) {
    chunks.push(chunk)
  }
  return chunks
}

/**
 *
 * @param {EncodedAddedData} data
 * @returns {AddedData}
 */
const decode = ({ path, cid, mode, mtime }) => {
  return {
    path,
    cid: new CID(cid),
    mode,
    mtime
  }
}

module.exports = FilesTopClient
