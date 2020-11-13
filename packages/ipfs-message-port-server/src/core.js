'use strict'

/* eslint-env browser */

const {
  decodeIterable,
  encodeIterable,
  decodeCallback
} = require('ipfs-message-port-protocol/src/core')
const { decodeCID, encodeCID } = require('ipfs-message-port-protocol/src/cid')

/**
 * @typedef {import("./ipfs").IPFS} IPFS
 * @typedef {import("ipfs-message-port-protocol/src/data").Time} Time
 * @typedef {import("ipfs-message-port-protocol/src/data").UnixFSTime} UnixFSTime
 * @typedef {import("ipfs-message-port-protocol/src/data").Mode} Mode
 * @typedef {import("ipfs-message-port-protocol/src/data").HashAlg} HashAlg
 * @typedef {import('ipfs-message-port-protocol/src/data').FileType} FileType
 * @typedef {import('ipfs-message-port-protocol/src/cid').EncodedCID} EncodedCID
 * @typedef {import("./ipfs").FileOutput} FileOutput
 * @typedef {import('./ipfs').FileObject} FileObject
 * @typedef {import('./ipfs').FileContent} DecodedFileContent
 * @typedef {import('./ipfs').FileInput} DecodedFileInput
 * @typedef {import('./ipfs').LsEntry} LsEntry
 */

/**
 * @typedef {import('ipfs-message-port-protocol/src/core').RemoteCallback} RemoteCallback
 */

/**
 * @template T
 * @typedef {import('ipfs-message-port-protocol/src/core').RemoteIterable<T>} RemoteIterable
 */

/**
 * @typedef {Object} AddOptions
 * @property {string} [chunker]
 * @property {number} [cidVersion]
 * @property {boolean} [enableShardingExperiment]
 * @property {HashAlg} [hashAlg]
 * @property {boolean} [onlyHash]
 * @property {boolean} [pin]
 * @property {RemoteCallback|void} [progress]
 * @property {boolean} [rawLeaves]
 * @property {number} [shardSplitThreshold]
 * @property {boolean} [trickle]
 * @property {boolean} [wrapWithDirectory]
 * @property {number} [timeout]
 * @property {AbortSignal} [signal]
 *
 * @typedef {Object} AddAllInput
 * @property {MultiFileInput} input
 *
 * @typedef {Object} AddInput
 * @property {SingleFileInput} input
 *
 * @typedef {AddInput & AddOptions} AddQuery
 * @typedef {AddAllInput & AddOptions} AddAllQuery
 *
 * @typedef {ArrayBuffer|ArrayBufferView|Blob|string|FileInput|RemoteIterable<ArrayBufferView|ArrayBuffer>} SingleFileInput
 * @typedef {RemoteIterable<ArrayBuffer|ArrayBufferView|Blob|string|FileInput>} MultiFileInput
 *
 * @typedef {Object} FileInput
 * @property {string} [path]
 * @property {FileContent} [content]
 * @property {Mode} [mode]
 * @property {Time} [mtime]
 *
 * @typedef {ArrayBufferView|ArrayBuffer|Blob|string|RemoteIterable<ArrayBufferView>|RemoteIterable<ArrayBuffer>} FileContent
 *
 * @typedef {Object} AddedEntry
 * @property {string} path
 * @property {EncodedCID} cid
 * @property {number} mode
 * @property {UnixFSTime} mtime
 * @property {number} size
 *
 * @typedef {Object} FileEntry
 * @property {string} path
 * @property {RemoteIterable<Uint8Array>} content
 * @property {Mode} [mode]
 * @property {UnixFSTime} [mtime]
 *
 *
 * @typedef {Object} EncodedLsEntry
 * @property {EncodedCID} cid
 * @property {FileType} type
 * @property {string} name
 * @property {string} path
 * @property {number} depth
 * @property {number} size
 * @property {Mode} mode
 * @property {UnixFSTime} [mtime]
 */

exports.CoreService = class CoreService {
  /**
   *
   * @param {IPFS} ipfs
   */
  constructor (ipfs) {
    this.ipfs = ipfs
  }

  /**
   * @typedef {Object} AddAllResult
   * @property {RemoteIterable<AddedEntry>} data
   * @property {Transferable[]} transfer
   *
   * @param {AddAllQuery} query
   * @returns {AddAllResult}
   */
  addAll (query) {
    const { input } = query
    const {
      chunker,
      cidVersion,
      enableShardingExperiment,
      hashAlg,
      onlyHash,
      pin,
      progress,
      rawLeaves,
      shardSplitThreshold,
      trickle,
      wrapWithDirectory,
      timeout,
      signal
    } = query

    let progressCallback

    if (progress) {
      const fn = decodeCallback(progress)
      progressCallback = (bytes, fileName) => fn([bytes, fileName])
    }

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
      progress: progressCallback,
      signal
    }

    const content = decodeAddAllInput(input)
    return encodeAddAllResult(this.ipfs.addAll(content, options))
  }

  /**
   * @typedef {Object} AddResult
   * @property {AddedEntry} data
   * @property {Transferable[]} transfer
   *
   * @param {AddQuery} query
   * @returns {Promise<AddResult>}
   */
  async add (query) {
    const { input } = query
    const {
      chunker,
      cidVersion,
      enableShardingExperiment,
      hashAlg,
      onlyHash,
      pin,
      progress,
      rawLeaves,
      shardSplitThreshold,
      trickle,
      wrapWithDirectory,
      timeout,
      signal
    } = query

    let progressCallback

    if (progress) {
      const fn = decodeCallback(progress)
      progressCallback = (bytes, fileName) => fn([bytes, fileName])
    }

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
      progress: progressCallback,
      signal
    }

    const content = decodeAddInput(input)
    return encodeAddResult(await this.ipfs.add(content, options))
  }

  /**
   * @typedef {Object} CatQuery
   * @property {string|EncodedCID} path
   * @property {number} [offset]
   * @property {number} [length]
   * @property {number} [timeout]
   * @property {AbortSignal} [signal]
   *
   * @typedef {Object} CatResult
   * @property {RemoteIterable<Uint8Array>} data
   * @property {Transferable[]} transfer
   *
   * @param {CatQuery} query
   * @returns {CatResult}
   */
  cat (query) {
    const { path, offset, length, timeout, signal } = query
    const location = typeof path === 'string' ? path : decodeCID(path)
    const content = this.ipfs.cat(location, { offset, length, timeout, signal })
    return encodeCatResult(content)
  }

  /**
   * @typedef {Object} LsQuery
   * @property {string|EncodedCID} path
   * @property {boolean} [preload]
   * @property {boolean} [recursive]
   * @property {number} [timeout]
   * @property {AbortSignal} [signal]
   *
   * @typedef {Object} LsResult
   * @property {RemoteIterable<EncodedLsEntry>} data
   * @property {Transferable[]} transfer
   *
   * @param {LsQuery} query
   * @returns {LsResult}
   */
  ls (query) {
    const { path, recursive, preload, timeout, signal } = query
    const location = typeof path === 'string' ? path : decodeCID(path)
    const entries = this.ipfs.ls(location, { recursive, preload, timeout, signal })
    return encodeLsResult(entries)
  }
}
// @returns {string|ArrayBufferView|ArrayBuffer|Blob|AsyncIterable<string>|AsyncIterable<ArrayBufferView>|AsyncIterable<ArrayBuffer>|AsyncIterable<Blob>|AsyncIterable<FileObject>}

/**
 * @param {MultiFileInput} input
 * @returns {AsyncIterable<string|ArrayBufferView|ArrayBuffer|Blob|FileObject>}
 */
const decodeAddAllInput = input =>
  decodeIterable(input, decodeFileInput)

/**
 * @param {SingleFileInput} input
 * @returns {string|ArrayBufferView|ArrayBuffer|Blob|FileObject}
 */
const decodeAddInput = input =>
  matchInput(
    input,
    /**
     * @param {*} data
     * @returns {*}
     */
    data => {
      if (data.type === 'RemoteIterable') {
        return { content: decodeIterable(data, decodeFileInput) }
      } else {
        return decodeFileInput(data)
      }
    }
  )

/**
 * @param {ArrayBufferView|ArrayBuffer|string|Blob|FileInput} input
 * @returns {string|ArrayBuffer|ArrayBufferView|Blob|FileObject}
 */
const decodeFileInput = input =>
  matchInput(input, file => ({
    ...file,
    content: file.content && decodeFileContent(file.content)
  }))

/**
 * @param {FileContent} content
 * @returns {DecodedFileContent}
 */
const decodeFileContent = content =>
  matchInput(content, input => decodeIterable(input, identity))

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
 * @param {AsyncIterable<FileOutput>} out
 * @returns {AddAllResult}
 */
const encodeAddAllResult = out => {
  /** @type {Transferable[]} */
  const transfer = []
  return {
    data: encodeIterable(out, encodeFileOutput, transfer),
    transfer
  }
}

/**
 * @param {FileOutput} out
 * @returns {AddResult}
 */
const encodeAddResult = out => {
  /** @type {Transferable[]} */
  const transfer = []
  return {
    data: encodeFileOutput(out, transfer),
    transfer
  }
}

/**
 *
 * @param {AsyncIterable<Uint8Array>} content
 * @returns {CatResult}
 */
const encodeCatResult = content => {
  /** @type {Transferable[]} */
  const transfer = []
  return { data: encodeIterable(content, moveBuffer, transfer), transfer }
}

/**
 *
 * @param {AsyncIterable<LsEntry>} entries
 * @returns {LsResult}
 */
const encodeLsResult = entries => {
  /** @type {Transferable[]} */
  const transfer = []
  return { data: encodeIterable(entries, encodeLsEntry, transfer), transfer }
}

/**
 *
 * @param {LsEntry} entry
 * @returns {EncodedLsEntry}
 */
const encodeLsEntry = ({ depth, name, path, size, cid, type, mode, mtime }) => ({
  cid: encodeCID(cid),
  type,
  name,
  path,
  mode,
  mtime,
  size,
  depth
})

/**
 * Adds underlying `ArrayBuffer` to the transfer list.
 *
 * @param {Uint8Array} buffer
 * @param {Transferable[]} transfer
 * @returns {Uint8Array}
 */
const moveBuffer = (buffer, transfer) => {
  transfer.push(buffer.buffer)
  return buffer
}

/**
 *
 * @param {FileOutput} file
 * @param {Transferable[]} _transfer
 */

const encodeFileOutput = (file, _transfer) => ({
  ...file,
  cid: encodeCID(file.cid)
})

/**
 * @template T
 * @param {T} v
 * @returns {T}
 */
const identity = v => v
