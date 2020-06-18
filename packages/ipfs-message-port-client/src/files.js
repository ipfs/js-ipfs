'use strict'

/* eslint-env browser */

const CID = require('cids')
const { Client } = require('./client')
const {
  decodeIterable,
  encodeIterable
} = require('ipfs-message-port-protocol/src/core')
const { decodeCID } = require('ipfs-message-port-protocol/src/cid')

/**
 * @typedef {import('ipfs-message-port-server/src/files').Files} API
 * @typedef {import('ipfs-message-port-server/src/files').EncodedContent} EncodedContent
 * @typedef {import('ipfs-message-port-server/src/files').Entry} EncodedEntry
 * @typedef {import('ipfs-message-port-server/src/files').EncodedStat} EncodedStat
 * @typedef {import('ipfs-message-port-protocol/src/data').UnixFSTime} UnixFSTime
 * @typedef {import('ipfs-message-port-protocol/src/data').FileType} FileType
 * @typedef {import('ipfs-message-port-protocol/src/data').Time} Time
 * @typedef {import('ipfs-message-port-protocol/src/data').Mode} Mode
 * @typedef {import('ipfs-message-port-protocol/src/data').HashAlg} HashAlg
 * @typedef {import('ipfs-message-port-protocol/src/data').CIDVersion} CIDVersion
 * @typedef {import('./client').ClientTransport} Transport
 */

/**
 * @class
 * @extends {Client<API>}
 */
class FilesClient extends Client {
  /**
   * @param {Transport} transport
   */
  constructor (transport) {
    super('files', ['chmod', 'stat'], transport)
  }

  /**
   * Change mode for files and directories
   * @param {ContentAddress} path - The path to the entry to modify
   * @param {Mode} mode
   * @param {Object} [options]
   * @param {boolean} [options.recursive=false]
   * @param {string} [options.hashAlg]
   * @param {boolean} [options.flush=true]
   * @param {number} [options.cidVersion=0]
   * @param {number} [options.timeout]
   * @param {AbortSignal} [options.signal]
   * @returns {Promise<void>}
   */
  chmod (path, mode, options = {}) {
    const { recursive, hashAlg, flush, cidVersion, signal, timeout } = options
    return this.remote.chmod({
      path: toPath(path),
      mode,
      recursive,
      hashAlg,
      flush,
      cidVersion,
      signal,
      timeout
    })
  }

  /**
   * Write to an MFS path
   * @typedef {string|ArrayBufferView|ArrayBuffer|AsyncIterable<ArrayBufferView>|Blob} WriteContent
   *
   * @param {string} path - The path of the file to write to.
   * @param {WriteContent} content - The content to write to the path
   * @param {Object} [options]
   * @param {number} [options.offset] - An offset to start writing to file at.
   * @param {number} [options.length] - Amount ofbytes to write from the content.
   * @param {boolean} [options.create=false] - Create the MFS path if it does not exist
   * @param {boolean} [options.parents=false] - Create intermediate MFS paths if they do not exist
   * @param {boolean} [options.truncate=false] - Truncate the file at the MFS path if it would have been larger than the passed content.
   * @param {boolean} [options.rawLeaves=false] - If true, DAG leaves will contain raw file data and not be wrapped in a protobuf
   * @param {number} [options.mode] - An integer that represents the file mode
   * @param {Time} [options.mtime] - Modififaction time of the file.
   * @param {boolean} [options.flush=true] - If true the changes will be immediately flushed to disk
   * @param {HashAlg} [options.hashAlg='sha2-256'] -The hash algorithm to use for any updated entries
   * @param {CIDVersion} [options.cidVersion] - The CID version to use for any updated entries
   * @param {number} [options.timeout] - A timeout in ms
   * @param {AbortSignal} [options.signal] - Can be used to cancel any long running requests started as a result of this call
   * @param {Transferable[]} [options.transfer] - Provide transferables for transfer
   * @returns {Promise<{cid: CID, size:number}>}
   */
  async write (path, content, options = {}) {
    const transfer = [...options.transfer]
    const result = await this.remote.write({
      ...options,
      path,
      content: encodeContent(content, transfer),
      transfer
    })

    return { ...result, cid: decodeCID(result.cid) }
  }

  /**
   * @typedef {Object} Entry
   * @property {string} name
   * @property {FileType} type
   * @property {number} size
   * @property {CID} cid
   * @property {number} mode
   * @property {UnixFSTime} mtime
   *
   * @param {string} [path='/']
   * @param {Object} [options]
   * @param {boolean} [options.sort=false]
   * @param {number} [options.timeout]
   * @param {AbortSignal} [options.signal]
   * @returns {AsyncIterable<Entry>}
   */
  async * ls (path = '/', options = {}) {
    const { sort, timeout, signal } = options
    const { entries } = await this.remote.ls({
      path,
      sort,
      timeout,
      signal
    })

    yield * decodeIterable(entries, decodeLsEntry)
  }

  // /**
  //  * Copy files.
  //  * @param {ContentAddress} from
  //  * @param {string} to
  //  * @param {Object} [options]
  //  * @param {boolean} [options.parents=false]
  //  * @param {string} [options.hashAlg]
  //  * @param {boolean} [options.flush=true]
  //  * @param {number} [options.timeout]
  //  * @param {AbortSignal} [options.signal]
  //  * @returns {Promise<void>}
  //  */
  // // @ts-ignore
  // cp (from, to, options, ...etc) {
  //   const args = [from, to, options, ...etc]
  //   const last = args.pop()
  //   const [sources, destination, opts] =
  //     typeof last === 'string' ? [args, last, {}] : [args, args.pop(), last]

  //   const { parents, hashAlg, flush } = opts
  //   return this.remote.cp(
  //     {
  //       // @ts-ignore could be called without any arguments.
  //       from: sources.map(toPath),
  //       to: destination,
  //       parents,
  //       hashAlg,
  //       flush
  //     },
  //     options
  //   )
  // }
  // /**
  //  * Make a directory.
  //  * @param {string} path The path to the directory to make
  //  * @param {Object} [options]
  //  * @param {boolean} [options.parents=false]
  //  * @param {string} [options.hashAlg]
  //  * @param {boolean} [options.flush=true]
  //  * @param {Mode} [options.mode]
  //  * @param {Time|Date} [options.mtime]
  //  * @param {number} [options.timeout]
  //  * @param {AbortSignal} [options.signal]
  //  * @returns {Promise<void>}
  //  */
  // mkdir (path, options = {}) {
  //   const { mtime, parents, flush, hashAlg, mode } = options

  //   return this.remote.mkdir(
  //     {
  //       path: toPath(path),
  //       mtime,
  //       parents,
  //       flush,
  //       hashAlg,
  //       mode
  //     },
  //     options
  //   )
  // }

  /**
   * @typedef {Object} Stat
   * @property {CID} cid Content identifier.
   * @property {number} size File size in bytes.
   * @property {number} cumulativeSize Size of the DAGNodes making up the file in bytes.
   * @property {"directory"|"file"} type
   * @property {number} blocks Number of files making up directory (when a direcotry)
   * or number of blocks that make up the file (when a file)
   * @property {boolean} withLocality True when locality information is present
   * @property {boolean} local True if the queried dag is fully present locally
   * @property {number} sizeLocal Cumulative size of the data present locally
   *
   * @param {ContentAddress} path
   * @param {Object} [options]
   * @param {boolean} [options.hash=false] If true will only return hash
   * @param {boolean} [options.size=false] If true will only return size
   * @param {boolean} [options.withLocal=false] If true computes size of the dag that is local, and total size when possible
   * @param {number} [options.timeout]
   * @param {AbortSignal} [options.signal]
   * @returns {Promise<Stat>}
   */
  async stat (path, options = {}) {
    const { size, hash, withLocal, timeout, signal } = options
    const { stat } = await this.remote.stat({
      path: toPath(path),
      size,
      hash,
      withLocal,
      timeout,
      signal
    })
    return decodeStat(stat)
  }
}
module.exports = FilesClient

/**
 * @param {EncodedEntry} entry
 * @returns {Entry}
 */
const decodeLsEntry = entry => {
  return {
    ...entry,
    cid: decodeCID(entry.cid)
  }
}

/**
 * @param {WriteContent} content - The content to write to the path
 * @param {Transferable[]} transfer
 * @returns {EncodedContent}
 */
const encodeContent = (content, transfer) => {
  if (typeof content === 'string') {
    return content
  } else if (ArrayBuffer.isView(content)) {
    return content
  } else if (content instanceof ArrayBuffer) {
    return content
  } else if (content instanceof Blob) {
    return content
  } else {
    return encodeIterable(content, identity, transfer)
  }
}

/**
 *
 * @typedef {string|CID} ContentAddress
 *
 *
 * @typedef {Object} LsEntry
 * @property {string} name
 * @property {FileType} type
 * @property {number} size
 * @property {CID} cid
 * @property {number} mode
 * @property {UnixFSTime} mtime
 */

/**
 * Turns content address (path or CID) into path.
 * @param {ContentAddress} address
 * @returns {string}
 */
const toPath = address =>
  CID.isCID(address) ? `/ipfs/${address.toString()}` : address.toString()

/**
 *
 * @param {EncodedStat} data
 * @returns {Stat}
 */
const decodeStat = data => {
  return { ...data, cid: decodeCID(data.cid) }
}

/**
 * @template T
 * @param {T} a
 * @returns {T}
 */
const identity = a => a
