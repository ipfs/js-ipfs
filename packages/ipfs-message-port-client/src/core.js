'use strict'

/* eslint-env browser */

const CID = require('cids')
const { Client } = require('./client')
const { encodeCID, decodeCID } = require('ipfs-message-port-protocol/src/cid')
const {
  decodeIterable,
  encodeIterable,
  encodeCallback
} = require('ipfs-message-port-protocol/src/core')

/**
 * @template T
 * @typedef {import('ipfs-message-port-protocol/src/core').RemoteIterable<T>} RemoteIterable
 */
/**
 * @typedef {import('ipfs-message-port-protocol/src/dag').EncodedCID} EncodedCID
 * @typedef {import('ipfs-message-port-server/src/core').AddInput} EncodedAddInput
 * @typedef {import('ipfs-message-port-server/src/core').FileInput} FileInput
 * @typedef {import('ipfs-message-port-server/src/core').FileContent} EncodedFileContent
 *
 * @typedef {Object} NoramilzedFileInput
 * @property {string} path
 * @property {AsyncIterable<ArrayBuffer>} content
 *
 * @typedef {ArrayBuffer|ArrayBufferView} Bytes
 *
 * @typedef {Blob|Bytes|string|Iterable<number>|Iterable<Bytes>|AsyncIterable<Bytes>|ReadableStream} FileContent
 *
 * @typedef {Object} FileObject
 * @property {string} [path]
 * @property {FileContent} [content]
 * @property {string|number} [mode]
 * @property {UnixTime} [mtime]
 *
 * @typedef {Date|Time|[number, number]} UnixTime
 *
 * @typedef {Blob|Bytes|string|FileObject|Iterable<Number>|Iterable<Bytes>|AsyncIterable<Bytes>|ReadableStream} SingleFileInput
 *
 * @typedef {Iterable<Blob>|Iterable<string>|Iterable<FileObject>|AsyncIterable<Blob>|AsyncIterable<string>|AsyncIterable<FileObject>} MultiFileInput
 *
 * @typedef {SingleFileInput | MultiFileInput} AddInput
 *
 */
/** @type {(input:AddInput) => AsyncIterable<NoramilzedFileInput>} */

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
 * @property {Transferable[]} [transfer]
 * @property {AbortSignal} [signal]
 *
 * @typedef {Object} AddedData
 * @property {string} path
 * @property {CID} cid
 * @property {number} mode
 * @property {number} size
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
class CoreClient extends Client {
  /**
   * @param {Transport} transport
   */
  constructor (transport) {
    super('core', ['add', 'cat'], transport)
  }

  /**
   * @param {AddInput} input
   * @param {AddOptions} [options]
   * @returns {AsyncIterable<AddedData>}
   */
  async * add (input, options = {}) {
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
    yield * decodeIterable(result.data, decodeAddedData)
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
    yield * decodeIterable(result.data, identity)
  }
}

/**
 *
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
const identity = v => v

/**
 * @param {AddInput} input
 * @param {Transferable[]} transfer
 * @returns {EncodedAddInput}
 */
const encodeAddInput = (input, transfer) => {
  // We want to get a Blob as input
  if (input instanceof Blob) {
    return input
  } else if (typeof input === 'string') {
    return input
  } else if (input instanceof ArrayBuffer) {
    return input
  } else if (ArrayBuffer.isView(input)) {
    return input
  } else {
    const iterable = asIterable(input)
    if (iterable) {
      return encodeIterable(iterable, encodeIterableContent, transfer)
    }

    const asyncIterable = asAsyncIterable(input)
    if (asyncIterable) {
      return encodeIterable(asyncIterable, encodeAsyncIterableContent, transfer)
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
  } else {
    const iterable = asIterable(content)
    if (iterable) {
      return encodeIterable(iterable, encodeIterableContent, transfer)
    }

    const asyncIterable = asAsyncIterable(content)
    if (asyncIterable) {
      return encodeIterable(asyncIterable, encodeAsyncIterableContent, transfer)
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
 * @template T
 * @param {ReadableStream<T>} stream
 * @returns {AsyncIterable<T>}
 */

const iterateReadableStream = async function * (stream) {
  const reader = stream.getReader()

  while (true) {
    const result = await reader.read()

    if (result.done) {
      return
    }

    yield result.value
  }
}

/**
 * @template I
 * @param {Iterable<I>|AddInput} input
 * @returns {Iterable<I>|null}
 */
const asIterable = input => {
  /** @type {*} */
  const object = input
  if (object && typeof object[Symbol.iterator] === 'function') {
    return object
  } else {
    return null
  }
}

/**
 * @template I
 * @param {AsyncIterable<I>|AddInput} input
 * @returns {AsyncIterable<I>|null}
 */
const asAsyncIterable = input => {
  /** @type {*} */
  const object = input
  if (object && typeof object[Symbol.asyncIterator] === 'function') {
    return object
  } else {
    return null
  }
}

/**
 * @param {any} input
 * @returns {ReadableStream<Uint8Array>|null}
 */
const asReadableStream = input => {
  if (input && typeof input.getReader === 'function') {
    return input
  } else {
    return null
  }
}

/**
 * @param {*} input
 * @returns {FileObject|null}
 */
const asFileObject = input => {
  if (typeof input === 'object' && (input.path || input.content)) {
    return input
  } else {
    return null
  }
}

module.exports = CoreClient
