'use strict'

/* eslint-env browser */

const CID = require('cids')
const { encodeAsyncIterable, decodeRemoteIterable } = require('./util')

/**
 * @template T
 * @typedef {import('ipfs-message-port-protocol/src/data').StringEncoded<T>} StringEncoded
 */
/**
 * @template T
 * @typedef {import('ipfs-message-port-protocol/src/data').RemoteIterable<T>} RemoteIterable
 */
/**
 * @typedef {import('ipfs-message-port-protocol/src/data').HashAlg} HashAlg
 * @typedef {import('ipfs-message-port-protocol/src/data').Mode} Mode
 * @typedef {import('ipfs-message-port-protocol/src/data').Time} Time
 * @typedef {import('ipfs-message-port-protocol/src/data').UnixFSTime} UnixFSTime
 * @typedef {import('ipfs-message-port-protocol/src/data').FileType} FileType
 * @typedef {import('ipfs-message-port-protocol/src/data').CIDVersion} CIDVersion

 * @typedef {import('./ipfs').IPFS} IPFS
 */

/**
 * @class
 */
class Files {
  /**
   *
   * @param {IPFS} ipfs
   */
  constructor (ipfs) {
    this.ipfs = ipfs
  }

  /**
   * @param {ChmodQuery} query
   * @returns {Promise<void>}
   */
  async chmod (query) {
    const cid = await new CID(query.path)
    throw new Error(cid.toString())
  }

  // cp(input: CpQuery): Promise<void>
  // mkdir(input: MkdirQuery): Promise<void>
  // stat(input: StatQuery): Promise<Stat>
  // touch(input: TouchQuery): Promise<void>
  // rm(input: RmQuery): Promise<void>
  // read(input: ReadQuery): Promise<ReadOutput>
  /**
   * @param {WriteQuery} query
   * @returns {Promise<WriteResult>}
   */
  async write (query) {
    const { path, content } = query
    const { cid, size } = await this.ipfs.files.write(
      path,
      decodeContent(content),
      query
    )
    return { cid: cid.toString(), size }
  }
  // mv(input: MvQuery): Promise<void>
  // flush(input: FlushQuery): Promise<StringEncoded<CID>>

  /**
   * @param {LsQuery} query
   * @returns {LsResult}
   */
  ls (query) {
    const { sort, timeout, signal } = query
    const entries = this.ipfs.files.ls(query.path, {
      sort,
      timeout,
      signal
    })
    return encodeAsyncIterable(entries)
  }
}
exports.Files = Files

/**
 * @param {EncodedContent} content
 * @returns {DecodedContent}
 */
const decodeContent = content => {
  if (typeof content === 'string') {
    return content
  } else if (ArrayBuffer.isView(content)) {
    return content
  } else if (content instanceof ArrayBuffer) {
    return content
  } else if (content instanceof Blob) {
    return content
  } else {
    return decodeRemoteIterable(content)
  }
}

/**
 * @typedef {Object} ChmodQuery
 * @prop {string} path
 * @prop {Mode} mode
 * @prop {boolean} [recursive]
 * @prop {HashAlg} [hashAlg]
 * @prop {boolean} [flush]
 * @prop {number} [cidVersion]
 */

// type CpQuery = {
//   from: string | StringEncoded<CID>
//   to: string | StringEncoded<CID>
//   parents?: boolean
//   hashAlg?: HashAlg
//   flush?: boolean
// }

// type MkdirQuery = {
//   path: string
//   // Note: Date objects seem to get copied over message port preserving
//   // Date type.
//   mtime?: Time
//   parents?: boolean
//   flush?: boolean
//   hashAlg?: HashAlg
//   mode?: Mode
// }

// type StatQuery = {
//   path: string
//   size?: boolean
//   hash?: HashAlg
//   withLocal?: boolean
// }

// type Stat = {
//   type: FileType
//   cid: StringEncoded<CID>
//   size: number
//   cumulativeSize: number
//   blocks: number
//   withLocality: boolean
//   local: boolean
//   sizeLocal: number
// }

// type TouchQuery = {
//   path: string
//   mtime?: Time
//   flush?: boolean
//   hashAlg?: HashAlg
//   cidVersion?: number
// }

// type RmQuery = {
//   paths: string[]
//   recursive?: boolean
//   flush?: boolean
//   hashAlg?: HashAlg
//   cidVersion?: number
// }

// type ReadQuery = {
//   path: string

//   offset?: number
//   length?: number
// }

// type ReadOutput = {
//   content: RemoteIterable<Uint8Array>
// }

// type WriteContent =
//   | string
//   | ArrayBufferView
//   | ArrayBuffer
//   | Blob
//   | RemoteIterable<Uint8Array>

/**
 * @typedef {string|ArrayBufferView|ArrayBuffer|Blob|RemoteIterable<Uint8Array>} EncodedContent
 * @typedef {string|ArrayBuffer|ArrayBufferView|Blob|AsyncIterable<Uint8Array>} DecodedContent
 * @typedef {Object} WriteQuery
 * @property {string} path
 * @property {EncodedContent} content
 * @property {number} [offset]
 * @property {number} [length]
 * @property {boolean} [create]
 * @property {boolean} [parents]
 * @property {boolean} [options]
 * @property {boolean} [rawLeaves]
 * @property {number} [mode]
 * @property {Time} [mtime]
 * @property {boolean} [flush]
 * @property {HashAlg} [hashAlg]
 * @property {CIDVersion} [cidVersion]
 * @property {number} [timeout]
 * @property {AbortSignal} [signal]
 *
 * @typedef {Object} WriteResult
 * @property {StringEncoded<CID>} cid
 * @property {number} size
 */

// type MvQuery = {
//   from: string | string[]
//   to: string

//   parents: boolean
//   flush: boolean
//   hashAlg: HashAlg
//   cidVersion: number
// }

// type FlushQuery = {
//   path: string
// }

/**
 * @typedef {Object} LsQuery
 * @property {string} path
 * @property {boolean} [sort]
 * @property {number} [timeout]
 * @property {AbortSignal} [signal]
 *
 * @typedef {Object} Entry
 * @property {string} name
 * @property {FileType} type
 * @property {number} size
 * @property {StringEncoded<CID>} cid
 * @property {number} mode
 * @property {UnixFSTime} mtime
 * @typedef {RemoteIterable<Entry>} LsResult
 */
