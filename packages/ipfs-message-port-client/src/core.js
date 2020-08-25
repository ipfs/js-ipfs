'use strict'

/* eslint-env browser */

const { Client } = require('./client')
const { encodeCID, decodeCID, CID } = require('ipfs-message-port-protocol/src/cid')
const {
  decodeIterable,
  encodeIterable,
  encodeCallback
} = require('ipfs-message-port-protocol/src/core')
/** @type {<T> (stream:ReadableStream<T>) => AsyncIterable<T>} */
// @ts-ignore - browser-stream-to-it has not types
const iterateReadableStream = require('browser-readablestream-to-it')

/**
 * @template T
 * @typedef {import('ipfs-message-port-protocol/src/core').RemoteIterable<T>} RemoteIterable
 */
/**
 * @typedef {import('ipfs-message-port-protocol/src/data').Time} Time
 * @typedef {import('ipfs-message-port-protocol/src/data').UnixFSTime} UnixFSTime
 * @typedef {import('ipfs-message-port-protocol/src/dag').EncodedCID} EncodedCID
 * @typedef {import('ipfs-message-port-server/src/core').SingleFileInput} EncodedAddInput
 * @typedef {import('ipfs-message-port-server/src/core').MultiFileInput} EncodedAddAllInput
 * @typedef {import('ipfs-message-port-server/src/core').FileInput} FileInput
 * @typedef {import('ipfs-message-port-server/src/core').FileContent} EncodedFileContent
 *
 * @typedef {Object} NoramilzedFileInput
 * @property {string} path
 * @property {AsyncIterable<ArrayBuffer>} content
 *
 * @typedef {ArrayBuffer|ArrayBufferView} Bytes
 *
 * @typedef {Blob|Bytes|string|Iterable<number>|Iterable<Bytes>|AsyncIterable<Bytes>} FileContent
 *
 * @typedef {Object} FileObject
 * @property {string} [path]
 * @property {FileContent} [content]
 * @property {string|number} [mode]
 * @property {UnixFSTime} [mtime]
 *
 *
 * @typedef {Blob|Bytes|string|FileObject|Iterable<number>|Iterable<Bytes>|AsyncIterable<Bytes>|ReadableStream} AddInput
 *
 * @typedef {Iterable<Blob|string|FileObject>|AsyncIterable<Blob|string|FileObject>} AddAllInput
 */

/**
 * @typedef {import('ipfs-message-port-server/src/core').CoreService} CoreService
 * @typedef {import('ipfs-message-port-server/src/core').AddedEntry} AddedEntry
 * @typedef {import('./client').ClientTransport} Transport
 */

/**
 * @class
 * @extends {Client<CoreService>}
 */
class CoreClient extends Client {
  /**
   * @param {Transport} transport
   */
  constructor (transport) {
    super('core', ['add', 'cat'], transport)
  }

  /**
   * Import files and data into IPFS.
   *
   * If you pass binary data like `Uint8Array` it is recommended to provide
   * `transfer: [input.buffer]` which would allow transferring it instead of
   * copying.
   *
   * @param {AddAllInput} input
   * @param {Object} [options]
   * @param {string} [options.chunker="size-262144"]
   * @param {number} [options.cidVersion=0]
   * @param {boolean} [options.enableShardingExperiment]
   * @param {string} [options.hashAlg="sha2-256"]
   * @param {boolean} [options.onlyHash=false]
   * @param {boolean} [options.pin=true]
   * @param {function(number):void} [options.progress]
   * @param {boolean} [options.rawLeaves=false]
   * @param {number} [options.shardSplitThreshold=1000]
   * @param {boolean} [options.trickle=false]
   * @param {boolean} [options.wrapWithDirectory=false]
   * @param {number} [options.timeout]
   * @param {Transferable[]} [options.transfer]
   * @param {AbortSignal} [options.signal]
   * @returns {AsyncIterable<AddedData>}
   *
   * @typedef {Object} AddedData
   * @property {string} path
   * @property {CID} cid
   * @property {number} mode
   * @property {number} size
   * @property {Time} mtime
   */
  async * addAll (input, options = {}) {
    const { timeout, signal } = options
    const transfer = [...(options.transfer || [])]
    const progress = options.progress
      ? encodeCallback(options.progress, transfer)
      : undefined

    const result = await this.remote.addAll({
      ...options,
      input: encodeAddAllInput(input, transfer),
      progress,
      transfer,
      timeout,
      signal
    })
    yield * decodeIterable(result.data, decodeAddedData)
  }

  /**
   * Add file to IPFS.
   *
   * If you pass binary data like `Uint8Array` it is recommended to provide
   * `transfer: [input.buffer]` which would allow transferring it instead of
   * copying.
   *
   * @param {AddInput} input
   * @param {Object} [options]
   * @param {string} [options.chunker="size-262144"]
   * @param {number} [options.cidVersion=0]
   * @param {boolean} [options.enableShardingExperiment]
   * @param {string} [options.hashAlg="sha2-256"]
   * @param {boolean} [options.onlyHash=false]
   * @param {boolean} [options.pin=true]
   * @param {function(number):void} [options.progress]
   * @param {boolean} [options.rawLeaves=false]
   * @param {number} [options.shardSplitThreshold=1000]
   * @param {boolean} [options.trickle=false]
   * @param {boolean} [options.wrapWithDirectory=false]
   * @param {number} [options.timeout]
   * @param {Transferable[]} [options.transfer]
   * @param {AbortSignal} [options.signal]
   * @returns {Promise<AddedData>}
   */
  async add (input, options = {}) {
    const { timeout, signal } = options
    const transfer = [...(options.transfer || [])]
    const progress = options.progress
      ? encodeCallback(options.progress, transfer)
      : undefined

    const result = await this.remote.add({
      ...options,
      input: encodeAddInput(input, transfer),
      progress,
      transfer,
      timeout,
      signal
    })

    return decodeAddedData(result.data)
  }

  /**
   * Returns content addressed by a valid IPFS Path.
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
    yield * decodeIterable(result.data, identity)
  }
}

/**
 * Decodes values yield by `ipfs.add`.
 * @param {AddedEntry} data
 * @returns {AddedData}
 */
const decodeAddedData = ({ path, cid, mode, mtime, size }) => {
  return {
    path,
    cid: decodeCID(cid),
    mode,
    mtime,
    size
  }
}

/**
 * @template T
 * @param {T} v
 * @returns {T}
 */
const identity = (v) => v

/**
 * Encodes input passed to the `ipfs.add` via the best possible strategy for the
 * given input.
 *
 * @param {AddInput} input
 * @param {Transferable[]} transfer
 * @returns {EncodedAddInput}
 */
const encodeAddInput = (input, transfer) => {
  // We want to get a Blob as input. If we got it we're set.
  if (input instanceof Blob) {
    return input
  } else if (typeof input === 'string') {
    return input
  } else if (input instanceof ArrayBuffer) {
    return input
  } else if (ArrayBuffer.isView(input)) {
    // Note we are not adding `input.buffer` into transfer list, it's on user.
    return input
  } else {
    // If input is (async) iterable or `ReadableStream` or "FileObject" it will
    // be encoded via own specific encoder.
    const iterable = asIterable(input)
    if (iterable) {
      return encodeIterable(iterable, encodeIterableContent, transfer)
    }

    const asyncIterable = asAsyncIterable(input)
    if (asyncIterable) {
      return encodeIterable(
        asyncIterable,
        encodeAsyncIterableContent,
        transfer
      )
    }

    const readableStream = asReadableStream(input)
    if (readableStream) {
      return encodeIterable(
        iterateReadableStream(readableStream),
        encodeAsyncIterableContent,
        transfer
      )
    }

    const file = asFileObject(input)
    if (file) {
      return encodeFileObject(file, transfer)
    }

    throw TypeError('Unexpected input: ' + typeof input)
  }
}

/**
 * Encodes input passed to the `ipfs.add` via the best possible strategy for the
 * given input.
 *
 * @param {AddAllInput} input
 * @param {Transferable[]} transfer
 * @returns {EncodedAddAllInput}
 */
const encodeAddAllInput = (input, transfer) => {
  // If input is (async) iterable or `ReadableStream` or "FileObject" it will
  // be encoded via own specific encoder.
  const iterable = asIterable(input)
  if (iterable) {
    return encodeIterable(iterable, encodeIterableContent, transfer)
  }

  const asyncIterable = asAsyncIterable(input)
  if (asyncIterable) {
    return encodeIterable(
      asyncIterable,
      encodeAsyncIterableContent,
      transfer
    )
  }

  const readableStream = asReadableStream(input)
  if (readableStream) {
    return encodeIterable(
      iterateReadableStream(readableStream),
      encodeAsyncIterableContent,
      transfer
    )
  }

  throw TypeError('Unexpected input: ' + typeof input)
}

/**
 * Function encodes individual item of some `AsyncIterable` by choosing most
 * effective strategy.
 * @param {ArrayBuffer|ArrayBufferView|Blob|string|FileObject} content
 * @param {Transferable[]} transfer
 * @returns {FileInput|ArrayBuffer|ArrayBufferView}
 */
const encodeAsyncIterableContent = (content, transfer) => {
  if (content instanceof ArrayBuffer) {
    return content
  } else if (ArrayBuffer.isView(content)) {
    return content
  } else if (content instanceof Blob) {
    return { path: '', content }
  } else if (typeof content === 'string') {
    return { path: '', content }
  } else {
    const file = asFileObject(content)
    if (file) {
      return encodeFileObject(file, transfer)
    } else {
      throw TypeError('Unexpected input: ' + typeof content)
    }
  }
}

/**
 * @param {number|Bytes|Blob|string|FileObject} content
 * @param {Transferable[]} transfer
 * @returns {FileInput|ArrayBuffer|ArrayBufferView}
 */
const encodeIterableContent = (content, transfer) => {
  if (typeof content === 'number') {
    throw TypeError('Iterable of numbers is not supported')
  } else if (content instanceof ArrayBuffer) {
    return content
  } else if (ArrayBuffer.isView(content)) {
    return content
  } else if (content instanceof Blob) {
    return { path: '', content }
  } else if (typeof content === 'string') {
    return { path: '', content }
  } else {
    const file = asFileObject(content)
    if (file) {
      return encodeFileObject(file, transfer)
    } else {
      throw TypeError('Unexpected input: ' + typeof content)
    }
  }
}

/**
 * @param {FileObject} file
 * @param {Transferable[]} transfer
 * @returns {FileInput}
 */
const encodeFileObject = ({ path, mode, mtime, content }, transfer) => {
  return {
    path,
    mode,
    mtime,
    content: encodeFileContent(content, transfer)
  }
}

/**
 *
 * @param {FileContent} [content]
 * @param {Transferable[]} transfer
 * @returns {EncodedFileContent}
 */
const encodeFileContent = (content, transfer) => {
  if (content == null) {
    return ''
  } else if (content instanceof ArrayBuffer || ArrayBuffer.isView(content)) {
    return content
  } else if (content instanceof Blob) {
    return content
  } else if (typeof content === 'string') {
    return content
  } else {
    const iterable = asIterable(content)
    if (iterable) {
      return encodeIterable(iterable, encodeIterableContent, transfer)
    }

    const asyncIterable = asAsyncIterable(content)
    if (asyncIterable) {
      return encodeIterable(
        asyncIterable,
        encodeAsyncIterableContent,
        transfer
      )
    }

    const readableStream = asReadableStream(content)
    if (readableStream) {
      return encodeIterable(
        iterateReadableStream(readableStream),
        encodeAsyncIterableContent,
        transfer
      )
    }

    throw TypeError('Unexpected input: ' + typeof content)
  }
}

/**
 * Pattern matches given input as `Iterable<I>` and returns back either matched
 * iterable or `null`.
 * @template I
 * @param {Iterable<I>|AddInput|AddAllInput} input
 * @returns {Iterable<I>|null}
 */
const asIterable = (input) => {
  /** @type {*} */
  const object = input
  if (object && typeof object[Symbol.iterator] === 'function') {
    return object
  } else {
    return null
  }
}

/**
 * Pattern matches given `input` as `AsyncIterable<I>` and returns back either
 * matched `AsyncIterable` or `null`.
 * @template I
 * @param {AsyncIterable<I>|AddInput|AddAllInput} input
 * @returns {AsyncIterable<I>|null}
 */
const asAsyncIterable = (input) => {
  /** @type {*} */
  const object = input
  if (object && typeof object[Symbol.asyncIterator] === 'function') {
    return object
  } else {
    return null
  }
}

/**
 * Pattern matches given `input` as `ReadableStream` and return back either
 * matched input or `null`.
 *
 * @param {any} input
 * @returns {ReadableStream<Uint8Array>|null}
 */
const asReadableStream = (input) => {
  if (input && typeof input.getReader === 'function') {
    return input
  } else {
    return null
  }
}

/**
 * Pattern matches given input as "FileObject" and returns back eithr matched
 * input or `null`.
 * @param {*} input
 * @returns {FileObject|null}
 */
const asFileObject = (input) => {
  if (typeof input === 'object' && (input.path || input.content)) {
    return input
  } else {
    return null
  }
}

module.exports = CoreClient
