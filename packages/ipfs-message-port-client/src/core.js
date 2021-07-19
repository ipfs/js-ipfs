'use strict'

/* eslint-env browser */

const Client = require('./client')
const { CID } = require('multiformats/cid')
const { encodeCID, decodeCID } = require('ipfs-message-port-protocol/src/cid')
const {
  decodeIterable,
  encodeIterable,
  encodeCallback
} = require('ipfs-message-port-protocol/src/core')
/** @type {<T>(stream:ReadableStream<T>) => AsyncIterable<T>} */
// @ts-ignore - browser-stream-to-it has no types
const iterateReadableStream = require('browser-readablestream-to-it')
const {
  parseMode,
  parseMtime
} = require('ipfs-unixfs')

/**
 * @template T
 * @typedef {import('ipfs-message-port-protocol/src/core').RemoteIterable<T>} RemoteIterable
 */

/**
 * @typedef {import('ipfs-message-port-protocol/src/cid').EncodedCID} EncodedCID
 * @typedef {import('ipfs-message-port-protocol/src/root').EncodedAddInput} EncodedAddInput
 * @typedef {import('ipfs-message-port-protocol/src/root').EncodedAddAllInput} EncodedAddAllInput
 * @typedef {import('ipfs-message-port-protocol/src/root').EncodedAddResult} EncodedAddResult
 * @typedef {import('ipfs-message-port-protocol/src/root').EncodedIPFSEntry} EncodedIPFSEntry
 * @typedef {import('ipfs-message-port-protocol/src/root').EncodedFileInput} EncodedFileInput
 * @typedef {import('ipfs-message-port-protocol/src/root').EncodedFileContent} EncodedFileContent
 * @typedef {import('ipfs-message-port-protocol/src/root').EncodedDirectoryInput} EncodedDirectoryInput
 *
 * @typedef {import('ipfs-message-port-server').CoreService} CoreService
 *
 * @typedef {import('./client').MessageTransport} MessageTransport
 * @typedef {import('./interface').MessagePortClientOptions} MessagePortClientOptions
 * @typedef {import('ipfs-core-types/src/root').API<MessagePortClientOptions>} RootAPI
 *
 * @typedef {import('ipfs-core-types/src/utils').ImportCandidate} ImportCandidate
 * @typedef {import('ipfs-core-types/src/utils').ToFile} ToFile
 * @typedef {import('ipfs-core-types/src/utils').ToDirectory} ToDirectory
 * @typedef {import('ipfs-core-types/src/utils').ToContent} ToContent
 * @typedef {import('ipfs-core-types/src/utils').ImportCandidateStream} ImportCandidateStream
 */

/**
 * @class
 * @extends {Client<CoreService>}
 */
class CoreClient extends Client {
  /**
   * @param {MessageTransport} transport
   */
  constructor (transport) {
    super('core', ['add', 'addAll', 'cat', 'ls'], transport)
  }
}

/**
 * Import files and data into IPFS.
 *
 * If you pass binary data like `Uint8Array` it is recommended to provide
 * `transfer: [input.buffer]` which would allow transferring it instead of
 * copying.
 *
 * @type {RootAPI["addAll"]}
 */
CoreClient.prototype.addAll = async function * addAll (input, options = {}) {
  const { timeout, signal } = options
  const transfer = [...(options.transfer || [])]
  const progressCallback = options.progress
    ? encodeCallback(options.progress, transfer)
    : undefined

  const result = await this.remote.addAll({
    ...options,
    input: encodeAddAllInput(input, transfer),
    progress: undefined,
    progressCallback,
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
 * @type {RootAPI["add"]}
 */
CoreClient.prototype.add = async function add (input, options = {}) {
  const { timeout, signal } = options
  const transfer = [...(options.transfer || [])]
  const progressCallback = options.progress
    ? encodeCallback(options.progress, transfer)
    : undefined

  const result = await this.remote.add({
    ...options,
    input: encodeAddInput(input, transfer),
    progress: undefined,
    progressCallback,
    transfer,
    timeout,
    signal
  })

  return decodeAddedData(result.data)
}

/**
 * Returns content addressed by a valid IPFS Path.
 *
 * @type {RootAPI["cat"]}
 */
CoreClient.prototype.cat = async function * cat (inputPath, options = {}) {
  const input = inputPath instanceof CID ? encodeCID(inputPath) : inputPath
  const result = await this.remote.cat({ ...options, path: input })
  yield * decodeIterable(result.data, identity)
}

/**
 * Returns content addressed by a valid IPFS Path.
 *
 * @type {RootAPI["ls"]}
 */
CoreClient.prototype.ls = async function * ls (inputPath, options = {}) {
  const input = inputPath instanceof CID ? encodeCID(inputPath) : inputPath
  const result = await this.remote.ls({ ...options, path: input })

  yield * decodeIterable(result.data, decodeLsEntry)
}

/**
 * Decodes values yield by `ipfs.add`.
 *
 * @param {EncodedAddResult} data
 * @returns {import('ipfs-core-types/src/root').AddResult}
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
 * @param {EncodedIPFSEntry} encodedEntry
 * @returns {import('ipfs-core-types/src/root').IPFSEntry}
 */
const decodeLsEntry = ({ depth, name, path, size, cid, type, mode, mtime }) => ({
  cid: decodeCID(cid),
  type,
  name,
  path,
  mode,
  mtime,
  size,
  depth
})

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
 * @param {ImportCandidate} input
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
 * @param {ImportCandidateStream} input
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
 *
 * @param {ImportCandidate} content
 * @param {Transferable[]} transfer
 * @returns {EncodedAddInput}
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
 * @param {ImportCandidate} content
 * @param {Transferable[]} transfer
 * @returns {EncodedAddInput}
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
 * @param {ToFile | ToDirectory} file
 * @param {Transferable[]} transfer
 * @returns {EncodedFileInput | EncodedDirectoryInput}
 */
const encodeFileObject = ({ path, mode, mtime, content }, transfer) => {
  /** @type {any} */
  const output = {
    path,
    mode: parseMode(mode),
    mtime: parseMtime(mtime)
  }

  if (content) {
    output.content = encodeFileContent(content, transfer)
  }

  return output
}

/**
 * @param {ToContent|undefined} content
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
 *
 * @template I
 * @param {Iterable<I>|ImportCandidate|ImportCandidateStream} input
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
 *
 * @template I
 * @param {AsyncIterable<I>|ImportCandidate|ImportCandidateStream} input
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
 *
 * @param {*} input
 * @returns {ToFile|null}
 */
const asFileObject = (input) => {
  if (typeof input === 'object' && (input.path || input.content)) {
    return input
  } else {
    return null
  }
}

module.exports = CoreClient
