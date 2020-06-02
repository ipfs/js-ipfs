'use strict'

/* eslint-env browser */

const {
  decodeRemoteIterable,
  encodeAsyncIterable,
  mapAsyncIterable
} = require('./util')

/**

/**
 * @typedef {import("./ipfs").IPFS} IPFS
 * @typedef {import("ipfs-message-port-protocol/src/data").Time} Time
 * @typedef {import("ipfs-message-port-protocol/src/data").Mode} Mode
 * @typedef {import("ipfs-message-port-protocol/src/core").AddInput} AddInput
 * @typedef {import("ipfs-message-port-protocol/src/core").FileInput} EncodedFileInput
 * @typedef {import("ipfs-message-port-protocol/src/core").FileContent} EncodedFileContent
 * @typedef {import("ipfs-message-port-protocol/src/core").AddQuery} AddQuery
 * @typedef {import("ipfs-message-port-protocol/src/core").AddResult} AddResult
 * @typedef {import("./ipfs").FileOutput} FileOutput
 * @typedef {import('./ipfs').FileObject} FileObject
 * @typedef {import('./ipfs').FileContent} DecodedFileContent
 * @typedef {import('./ipfs').FileInput} DecodedFileInput

 */

/**
 * @template T
 * @typedef {import('ipfs-message-port-protocol/src/data').RemoteIterable<T>} RemoteIterable
 */

/**
 * @class
 */
class Core {
  /**
   *
   * @param {IPFS} ipfs
   */
  constructor (ipfs) {
    this.ipfs = ipfs
  }

  /**
   *
   * @param {AddQuery} query
   * @returns {AddResult}
   */
  add (query) {
    const { input } = query
    const {
      chunker,
      cidVersion,
      enableShardingExperiment,
      hashAlg,
      onlyHash,
      pin,
      // progress,
      rawLeaves,
      shardSplitThreshold,
      trickle,
      wrapWithDirectory,
      timeout,
      signal
    } = query

    const options = {
      chunker,
      cidVersion,
      enableShardingExperiment,
      hashAlg,
      onlyHash,
      pin,
      rawLeaves,
      shardSplitThreshold,
      trickle,
      wrapWithDirectory,
      timeout,
      signal
    }

    const content = decodeAddInput(input)
    return encodeAddResult(this.ipfs.add(content, options))
  }

  /**
   * @param {Object} query
   * @param {string} query.path
   * @param {number} [query.offset]
   * @param {number} [query.length]
   * @param {number} [query.timeout]
   * @param {AbortSignal} [query.signal]
   * @returns {RemoteIterable<Uint8Array>}
   */
  cat (query) {
    const { path, offset, length, timeout, signal } = query
    const content = this.ipfs.cat(path, { offset, length, timeout, signal })
    return encodeAsyncIterable(content)
  }
}

/**
 * @param {AddInput} input
 * @returns {string|ArrayBufferView|ArrayBuffer|Blob|AsyncIterable<string>|AsyncIterable<ArrayBufferView>|AsyncIterable<ArrayBuffer>|AsyncIterable<Blob>|AsyncIterable<FileObject>}
 */
const decodeAddInput = input =>
  matchInput(
    input,
    /**
     * @param {*} data
     * @returns {*}
     */
    data => {
      const iterable = decodeRemoteIterable(data)
      const decoded = mapAsyncIterable(iterable, decodFileInput)
      return decoded
    }
  )

/**
 * @property {string|void} [path]
 * @property {DecodedFileContent} content
 * @property {Mode|void} [mode]
 * @property {Time|void} [mtime]

 * @param {ArrayBufferView|ArrayBuffer|string|Blob|EncodedFileInput} input
 * @returns {string|ArrayBuffer|ArrayBufferView|Blob|FileObject}
 */
const decodFileInput = input =>
  matchInput(input, file => ({
    ...file,
    content: decodeFileContent(file.content)
  }))

/**
 * @param {EncodedFileContent} content
 * @returns {DecodedFileContent}
 */
const decodeFileContent = content => matchInput(content, decodeRemoteIterable)

/**
 * @template I,O
 * @param {string|ArrayBuffer|ArrayBufferView|Blob|I} input
 * @param {function(I):O} decode
 * @returns {string|ArrayBuffer|ArrayBufferView|Blob|O}
 */
const matchInput = (input, decode) => {
  if (
    typeof input === 'string' ||
    input instanceof ArrayBuffer ||
    input instanceof Blob ||
    ArrayBuffer.isView(input)
  ) {
    return input
  } else {
    return decode(input)
  }
}

/**
 *
 * @param {AsyncIterable<FileOutput>} out
 * @returns {RemoteIterable<FileOutput>}
 */
const encodeAddResult = out =>
  encodeAsyncIterable(mapAsyncIterable(out, encodeFileOutput))

/**
 *
 * @param {FileOutput} file
 */

const encodeFileOutput = file => ({
  ...file,
  cid: file.cid.toString()
})

exports.Core = Core
