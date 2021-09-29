
/* eslint-env browser */

import {
  decodeIterable,
  encodeIterable,
  decodeCallback
} from 'ipfs-message-port-protocol/core'
import { decodeCID, encodeCID } from 'ipfs-message-port-protocol/cid'

/**
 * @typedef {import('multiformats/cid').CIDVersion} CIDVersion
 * @typedef {import('ipfs-core-types').IPFS} IPFS
 * @typedef {import('ipfs-core-types/src/root').AddOptions} AddOptions
 * @typedef {import('ipfs-core-types/src/root').AddAllOptions} AddAllOptions
 * @typedef {import('ipfs-core-types/src/root').IPFSEntry} IPFSEntry
 * @typedef {import('ipfs-message-port-protocol/src/cid').EncodedCID} EncodedCID
 * @typedef {import('ipfs-core-types/src/utils').ImportCandidateStream} ImportCandidateStream
 * @typedef {import('ipfs-core-types/src/utils').ImportCandidate} ImportCandidate
 * @typedef {import('ipfs-core-types/src/root').AddResult} AddResult
 * @typedef {import('ipfs-message-port-protocol/src/root').EncodedAddInput} EncodedAddInput
 * @typedef {import('ipfs-message-port-protocol/src/root').EncodedAddAllInput} EncodedAddAllInput
 * @typedef {import('ipfs-message-port-protocol/src/root').EncodedFileContent} EncodedFileContent
 * @typedef {import('ipfs-message-port-protocol/src/root').EncodedIPFSEntry} EncodedIPFSEntry
 */

/**
 * @typedef {import('ipfs-message-port-protocol/src/core').RemoteCallback} RemoteCallback
 */

/**
 * @template T
 * @typedef {import('ipfs-message-port-protocol/src/core').RemoteIterable<T>} RemoteIterable
 */

/**
 * @typedef {Object} AddAllInput
 * @property {EncodedAddAllInput} input
 * @property {RemoteCallback} [progressCallback]
 *
 * @typedef {Object} AddInput
 * @property {EncodedAddInput} input
 * @property {RemoteCallback} [progressCallback]
 *
 * @typedef {AddInput & AddOptions} AddQuery
 * @typedef {AddAllInput & AddAllOptions} AddAllQuery
 */

export class CoreService {
  /**
   * @param {IPFS} ipfs
   */
  constructor (ipfs) {
    this.ipfs = ipfs
  }

  /**
   * @param {AddAllQuery} query
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
      progressCallback,
      rawLeaves,
      shardSplitThreshold,
      trickle,
      wrapWithDirectory,
      timeout,
      signal
    } = query

    let progress

    if (progressCallback) {
      const fn = decodeCallback(progressCallback)
      /** @type {import('ipfs-core-types/src/root').AddProgressFn} */
      progress = (bytes, fileName) => { fn([bytes, fileName]) }
    }

    /** @type {AddAllOptions} */
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
      progress,
      signal
    }

    const content = decodeAddAllInput(input)
    return encodeAddAllResult(this.ipfs.addAll(content, options))
  }

  /**
   * @param {AddQuery} query
   */
  async add (query) {
    const { input } = query
    const {
      chunker,
      cidVersion,
      hashAlg,
      onlyHash,
      pin,
      progressCallback,
      rawLeaves,
      trickle,
      wrapWithDirectory,
      timeout,
      signal
    } = query

    let progress

    if (progressCallback) {
      const fn = decodeCallback(progressCallback)
      /** @type {import('ipfs-core-types/src/root').AddProgressFn} */
      progress = (bytes, fileName) => { fn([bytes, fileName]) }
    }

    /** @type {AddOptions} */
    const options = {
      chunker,
      cidVersion,
      hashAlg,
      onlyHash,
      pin,
      rawLeaves,
      trickle,
      wrapWithDirectory,
      timeout,
      progress,
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
   * @param {CatQuery} query
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
   * @param {LsQuery} query
   */
  ls (query) {
    const { path, recursive, preload, timeout, signal } = query
    const location = typeof path === 'string' ? path : decodeCID(path)
    const entries = this.ipfs.ls(location, { recursive, preload, timeout, signal })
    return encodeLsResult(entries)
  }
}

/**
 * @param {EncodedAddAllInput} input
 * @returns {ImportCandidateStream}
 */
const decodeAddAllInput = input =>
  decodeIterable(input, decodeFileInput)

/**
 * @param {*} input
 */
const decodeAddInput = input =>
  matchInput(
    input,
    data => {
      if (data.type === 'RemoteIterable') {
        return { content: decodeIterable(data, decodeFileInput) }
      } else {
        return decodeFileInput(data)
      }
    }
  )

/**
 *
 * @param {*} input
 * @returns
 */
const decodeFileInput = input =>
  matchInput(input, file => ({
    ...file,
    content: file.content && decodeFileContent(file.content)
  }))

/**
 * @param {EncodedFileContent} content
 */
const decodeFileContent = content =>
  matchInput(content, input => decodeIterable(input, identity))

/**
 * @template I, O
 * @param {I} input
 * @param {(input: any) => O} decode
 * @returns {I | O}
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
 * @param {AsyncIterable<AddResult>} out
 */
const encodeAddAllResult = out => {
  /** @type {Set<Transferable>} */
  const transfer = new Set()
  return {
    data: encodeIterable(out, encodeFileOutput, transfer),
    transfer
  }
}

/**
 * @param {AddResult} out
 */
const encodeAddResult = out => {
  /** @type {Set<Transferable>} */
  const transfer = new Set()
  return {
    data: encodeFileOutput(out, transfer),
    transfer
  }
}

/**
 * @param {AsyncIterable<Uint8Array>} content
 */
const encodeCatResult = content => {
  /** @type {Set<Transferable>} */
  const transfer = new Set()
  return { data: encodeIterable(content, moveBuffer, transfer), transfer }
}

/**
 * @param {AsyncIterable<IPFSEntry>} entries
 */
const encodeLsResult = entries => {
  /** @type {Set<Transferable>} */
  const transfer = new Set()
  return { data: encodeIterable(entries, encodeLsEntry, transfer), transfer }
}

/**
 * @param {IPFSEntry} entry
 */
const encodeLsEntry = ({ name, path, size, cid, type, mode, mtime }) => ({
  cid: encodeCID(cid),
  type,
  name,
  path,
  mode,
  mtime,
  size
})

/**
 * Adds underlying `ArrayBuffer` to the transfer list.
 *
 * @param {Uint8Array} buffer
 * @param {Set<Transferable>} transfer
 * @returns {Uint8Array}
 */
const moveBuffer = (buffer, transfer) => {
  transfer.add(buffer.buffer)
  return buffer
}

/**
 * @param {AddResult} file
 * @param {Set<Transferable>} _transfer
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
