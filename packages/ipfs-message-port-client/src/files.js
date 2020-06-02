'use strict'

/* eslint-env browser */

const CID = require('cids')
const { Client } = require('./client')
const {
  decodeRemoteIterable,
  encodeAsyncIterable
} = require('ipfs-message-port-server/src/util')

/**
 * @typedef {import('ipfs-message-port-server/src/files').Files} API
 * @typedef {import('ipfs-message-port-server/src/files').EncodedContent} EncodedContent
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
class Files extends Client {
  /**
   * @param {Transport} transport
   */
  constructor (transport) {
    super('files', ['chmod'], transport)
  }

  /**
   * Change mode for files and directories
   * @param {ContentAddress} path - The path to the entry to modify
   * @param {Mode} mode
   * @param {ChmodOptions} [options]
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
   * @returns {Promise<{cid: CID, size:number}>}
   */
  async write (path, content, options = {}) {
    const [data, transfer] = encodeContent(content)
    const { cid, size } = await this.remote.write({
      ...options,
      path,
      content: data,
      transfer: transfer
    })

    return { cid: new CID(cid), size }
  }

  /**
   *
   * @param {string} [path='/']
   * @param {LsOptions} [options]
   * @returns {AsyncIterable<LsEntry>}
   */
  async * ls (path = '/', options = {}) {
    const { sort, timeout, signal } = options
    const entries = await this.remote.ls({
      path,
      sort,
      timeout,
      signal
    })

    for await (const entry of decodeRemoteIterable(entries)) {
      const cid = new CID(entry.cid)
      yield { ...entry, cid }
    }
  }
}
exports.Files = Files

/**
 * @param {WriteContent} content - The content to write to the path
 * @returns {[EncodedContent] | [EncodedContent, Transferable[]]}
 */
const encodeContent = content => {
  if (typeof content === 'string') {
    return [content]
  } else if (ArrayBuffer.isView(content)) {
    return [content, [content.buffer]]
  } else if (content instanceof ArrayBuffer) {
    return [content, [content]]
  } else if (content instanceof Blob) {
    return [content]
  } else {
    const data = encodeAsyncIterable(content)
    return [data, [data.port]]
  }
}

/**
 *
 * @typedef {string|CID} ContentAddress
 *
 * @typedef {Object} ChmodOptions
 * @property {boolean} [recursive=false]
 * @property {string} [hashAlg]
 * @property {boolean} [flush=true]
 * @property {number} [cidVersion=0]
 * @property {number} [timeout]
 * @property {AbortSignal} [signal]
 *
 * @typedef {Object} LsOptions
 * @property {boolean} [sort=false]
 * @property {number} [timeout]
 * @property {AbortSignal} [signal]
 * @typedef {Object} LsEntry
 * @property {string} name
 * @property {FileType} type
 * @property {number} size
 * @property {CID} cid
 * @property {number} mode
 * @property {UnixFSTime} mtime
 */

// /**
//  * @typedef {import('./connection')} RPCConnection
//  * @typedef {import('./connection').RPCRequestOptions} RPCRequestOptions
//  *
//  * @typedef {number|string} Mode
//  * @typedef {{ secs:number, nsecs:number }} Time
//  *
//  * @typedef {string|CID} ContentAddress
//  *
//  * @typedef {Object} Chmod
//  * @property {boolean} [recursive=false]
//  * @property {string} [hashAlg]
//  * @property {boolean} [flush=true]
//  * @property {number} [cidVersion=0]
//  *
//  * @typedef {Object} CP
//  * @property {boolean} [parents=false]
//  * @property {string} [hashAlg]
//  * @property {boolean} [flush=true]
//  *
//  * @typedef {Object} Mkdir
//  * @property {boolean} [parents=false]
//  * @property {string} [hashAlg]
//  * @property {boolean} [flush=true]
//  * @property {Mode} [mode]
//  * @property {Time|Date} [mtime]
//  *
//  * @typedef {Object} StatQuery
//  * @property {boolean} [hash=false] If true will only return hash
//  * @property {boolean} [size=false] If true will only return size
//  * @property {boolean} [withLocal=false] If true computes size of the dag that is local, and total size when possible
//  *
//  * @typedef {Object} Stat
//  * @property {CID} cid Content identifier.
//  * @property {number} size File size in bytes.
//  * @property {number} cumulativeSize Size of the DAGNodes making up the file in bytes.
//  * @property {"directory"|"file"} type
//  * @property {number} blocks Number of files making up directory (when a direcotry)
//  * or number of blocks that make up the file (when a file)
//  * @property {boolean} withLocality True when locality information is present
//  * @property {boolean} local True if the queried dag is fully present locally
//  * @property {number} sizeLocal Cumulative size of the data present locally
//  */

// /**
//  * @template T
//  * @typedef {T & RPCRequestOptions} Options
//  */

// class FilesClient {
//   /**
//    *
//    * @param {RPCConnection} connection
//    */
//   constructor (connection) {
//     this.connection = connection
//   }

//   /**
//    * Change mode for files and directories
//    * @param {ContentAddress} path The path to the entry to modify
//    * @param {Mode} mode
//    * @param {Options<Chmod>} [options]
//    * @returns {Promise<void>}
//    */
//   chmod (path, mode, options = {}) {
//     const { recursive, hashAlg, flush, cidVersion, signal, timeout } = options
//     return this.connection.call(
//       'files/chmod',
//       {
//         path: toPath(path),
//         mode,
//         recursive,
//         hashAlg,
//         flush,
//         cidVersion,
//         timeout
//       },
//       {
//         signal
//       }
//     )
//   }
//   /**
//    * Copy files.
//    * // @ts-ignore
//    * @param {ContentAddress} from
//    * @param {string} to
//    * @param {Options<CP>} [options]
//    * @returns {Promise<void>}
//    */
//   // @ts-ignore
//   cp (from, to, options, ...etc) {
//     const args = [from, to, options, ...etc]
//     const last = args.pop()
//     /** @type [string[], string, Options<CP>] */
//     const [sources, destination, opts] =
//       typeof last === 'string' ? [args, last, {}] : [args, args.pop(), last]

//     const { parents, hashAlg, flush } = opts
//     return this.connection.call(
//       'files/cp',
//       {
//         // @ts-ignore could be called without any arguments.
//         from: sources.map(toPath),
//         to: destination,
//         parents,
//         hashAlg,
//         flush
//       },
//       options
//     )
//   }
//   /**
//    * Make a directory.
//    * @param {string} path The path to the directory to make
//    * @param {Options<Mkdir>} [options]
//    * @returns {Promise<void>}
//    */
//   mkdir (path, options = {}) {
//     const { mtime, parents, flush, hashAlg, mode } = options

//     return this.connection.call(
//       'files/mkdir',
//       {
//         path: toPath(path),
//         mtime,
//         parents,
//         flush,
//         hashAlg,
//         mode
//       },
//       options
//     )
//   }

//   /**
//    *
//    * @param {ContentAddress} path
//    * @param {Options<StatQuery>} options
//    * @returns {Promise<Stat>}
//    */
//   async stat (path, options = {}) {
//     const { size, hash, withLocal } = options
//     const data = await this.connection.call(
//       'files/stat',
//       {
//         path: toPath(path),
//         size,
//         hash,
//         withLocal
//       },
//       options
//     )
//     return decodeStat(data)
//   }
// }

/**
 * Turns content address (path or CID) into path.
 * @param {ContentAddress} address
 * @returns {string}
 */
const toPath = address =>
  CID.isCID(address) ? `/ipfs/${address.toString()}` : address.toString()

// /**
//  *
//  * @param {Stat} data
//  * @returns {Stat}
//  */
// const decodeStat = data => {
//   data.cid = new CID(data.cid)
//   return data
// }

// module.exports = FilesClient
