'use strict'

/* eslint-env browser */

const {
  decodeRemoteIterable,
  encodeAsyncIterable,
  mapAsyncIterable
} = require('ipfs-message-port-protocol/src/core')
const { decodeCID } = require('ipfs-message-port-protocol/src/dag')

/**

/**
 * @typedef {import("./ipfs").IPFS} IPFS
 * @typedef {import("ipfs-message-port-protocol/src/data").Time} Time
 * @typedef {import("ipfs-message-port-protocol/src/data").Mode} Mode
 * @typedef {import("ipfs-message-port-protocol/src/data").HashAlg} HashAlg
 * @typedef {import('ipfs-message-port-protocol/src/dag').EncodedCID} EncodedCID
 * @typedef {import("./ipfs").FileOutput} FileOutput
 * @typedef {import('./ipfs').FileObject} FileObject
 * @typedef {import('./ipfs').FileContent} DecodedFileContent
 * @typedef {import('./ipfs').FileInput} DecodedFileInput
 */

/**
 * @typedef {Object} AddQuery
 * @property {AddInput} input
 * @property {string} [chunker]
 * @property {number} [cidVersion]
 * @property {boolean} [enableShardingExperiment]
 * @property {HashAlg} [hashAlg]
 * @property {boolean} [onlyHash]
 * @property {boolean} [pin]
 * @property {RemoteCallback<number>} [progress]
 * @property {boolean} [rawLeaves]
 * @property {number} [shardSplitThreshold]
 * @property {boolean} [trickle]
 * @property {boolean} [wrapWithDirectory]
 * @property {number} [timeout]
 * @property {AbortSignal} [signal]
 *
 * @typedef {SingleFileInput | MultiFileInput} AddInput
 * @typedef {ArrayBuffer|ArrayBufferView|Blob|string|RemoteIterable<ArrayBufferView>|RemoteIterable<ArrayBuffer>} SingleFileInput
 * @typedef {RemoteIterable<Blob>|RemoteIterable<string>|RemoteIterable<FileInput>} MultiFileInput
 *
 * @typedef {Object} FileInput
 * @property {string} [path]
 * @property {FileContent} content
 * @property {Mode} mode
 * @property {Time} mtim
 *
 * @typedef {ArrayBufferView|ArrayBuffer|string|RemoteIterable<ArrayBufferView>|RemoteIterable<ArrayBuffer>} FileContent
 *
 * @typedef {Object} AddedEntry
 * @property {string} path
 * @property {EncodedCID} cid
 * @property {number} mode
 * @property {UnixFSTime} mtime
 * @property {number} size
 *
 * @typedef {RemoteIterable<AddedEntry>} AddResult
 *
 * @typedef {Object} CatQuery
 * @property {string} path
 * @property {number} [offset]
 * @property {number} [length]
 *
 * @typedef {RemoteIterable<Uint8Array>} CatResult
 *
 * @typedef {Object} GetQuery
 * @property {string} path
 *
 * @typedef {RemoteIterable<FileEntry>} GetResult
 *
 * @typedef {Object} FileEntry
 * @property {string} path
 * @property {RemoteIterable<Uint8Array>} content
 * @property {Mtime} [mode]
 * @property {UnixFSTime} [mtime]
 *
 * @typedef {Object} LsQuery
 * @property {string} path
 *
 * @typedef {RemoteIterable<LsEntry>} LsResult
 *
 * @typedef {Object} LsEntry
 * @property {number} depth
 * @property {string} name
 * @property {string} path
 * @property {number} size
 * @property {EncodedCID} cid
 * @property {FileType} type
 * @property {Mode} mode
 * @property {UnixFSTime} mtime
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
   * @param {string|EncodedCID} query.path
   * @param {number} [query.offset]
   * @param {number} [query.length]
   * @param {number} [query.timeout]
   * @param {AbortSignal} [query.signal]
   * @returns {RemoteIterable<Uint8Array>}
   */
  cat (query) {
    const { path, offset, length, timeout, signal } = query
    const location = typeof path === 'string' ? path : decodeCID(path)
    const content = this.ipfs.cat(location, { offset, length, timeout, signal })
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

 * @param {ArrayBufferView|ArrayBuffer|string|Blob|FileInput} input
 * @returns {string|ArrayBuffer|ArrayBufferView|Blob|FileObject}
 */
const decodFileInput = input =>
  matchInput(input, file => ({
    ...file,
    content: decodeFileContent(file.content)
  }))

/**
 * @param {FileContent} content
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
