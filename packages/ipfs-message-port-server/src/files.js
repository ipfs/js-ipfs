'use strict'

/* eslint-env browser */

const CID = require('cids')
const {
  encodeIterable,
  decodeIterable
} = require('ipfs-message-port-protocol/src/core')
const { encodeCID } = require('ipfs-message-port-protocol/src/cid')

/**
 * @typedef {import('ipfs-message-port-protocol/src/dag').EncodedCID} EncodedCID
 */
/**
 * @template T
 * @typedef {import('ipfs-message-port-protocol/src/core').RemoteIterable<T>} RemoteIterable
 */
/**
 * @typedef {import('ipfs-message-port-protocol/src/data').HashAlg} HashAlg
 * @typedef {import('ipfs-message-port-protocol/src/data').Mode} Mode
 * @typedef {import('ipfs-message-port-protocol/src/data').Time} Time
 * @typedef {import('ipfs-message-port-protocol/src/data').UnixFSTime} UnixFSTime
 * @typedef {import('ipfs-message-port-protocol/src/data').FileType} FileType
 * @typedef {import('ipfs-message-port-protocol/src/data').CIDVersion} CIDVersion

 * @typedef {import('./ipfs').IPFS} IPFS
 * @typedef {Stat} EncodedStat
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
  /**
   * @typedef {Object} StatQuery
   * @property {string} path
   * @property {boolean} [hash=false]
   * @property {boolean} [size=false]
   * @property {boolean} [withLocal=false]
   * @property {number} [timeout]
   * @property {AbortSignal} [signal]
   *
   * @typedef {Object} Stat
   * @property {EncodedCID} cid
   * @property {number} size
   * @property {number} cumulativeSize
   * @property {'file'|'directory'} type
   * @property {number} blocks
   * @property {boolean} withLocality
   * @property {boolean} local
   * @property {number} sizeLocal
   *
   * @typedef {Object} StatResult
   * @property {Stat} stat
   * @property {Transferable[]} transfer
   *
   * @param {StatQuery} input
   * @returns {Promise<StatResult>}
   */
  async stat (input) {
    const stat = await this.ipfs.files.stat(input.path, input)
    /** @type {Transferable[]} */
    const transfer = []
    return { stat: { ...stat, cid: encodeCID(stat.cid, transfer) }, transfer }
  }

  // touch(input: TouchQuery): Promise<void>
  // rm(input: RmQuery): Promise<void>
  // read(input: ReadQuery): Promise<ReadOutput>
  /**
   * @param {WriteQuery} query
   * @returns {Promise<WriteResult>}
   */
  async write (query) {
    const { path, content } = query
    const result = await this.ipfs.files.write(
      path,
      decodeContent(content),
      query
    )
    return { ...result, cid: encodeCID(result.cid) }
  }
  // mv(input: MvQuery): Promise<void>
  // flush(input: FlushQuery): Promise<StringEncoded<CID>>

  /**
   * @typedef {Object} LsQuery
   * @property {string} path
   * @property {boolean} [sort]
   * @property {number} [timeout]
   * @property {AbortSignal} [signal]
   *
   * @typedef {Object} LsResult
   * @property {RemoteIterable<Entry>} entries
   * @property {Transferable[]} transfer
   *
   * @param {LsQuery} query
   * @returns {LsResult}
   */
  ls (query) {
    const { sort, timeout, signal } = query
    /** @type {Transferable[]} */
    const transfer = []
    const entries = this.ipfs.files.ls(query.path, {
      sort,
      timeout,
      signal
    })
    return {
      entries: encodeIterable(entries, identity, transfer),
      transfer
    }
  }
}
exports.Files = Files

/**
 * @typedef {Object} Entry
 * @property {string} name
 * @property {FileType} type
 * @property {number} size
 * @property {EncodedCID} cid
 * @property {number} mode
 * @property {UnixFSTime} mtime
 */

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
    return decodeIterable(content, identity)
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
 * @property {EncodedCID} cid
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
 * @template T
 * @param {T} a
 * @returns {T}
 */
const identity = a => a
