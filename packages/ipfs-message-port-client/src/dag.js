'use strict'

const { Client } = require('./client')
const CID = require('cids')

/**
 * @typedef {import('ipfs-message-port-protocol/src/data').JSONValue} JSONValue
 * @typedef {import('ipfs-message-port-protocol/src/dag').DAGAPI} API
 * @typedef {import('./client').ClientTransport} Transport
 */

/**
 * @typedef {PutWithFormat|PutWithCID} PutOptions
 *
 * @typedef {Object} PutWithFormat
 * An optional object which may be passed to `ipfs.dag.put`.
 * @property {string} [format="dag-cbor"] - The IPLD format multicodec
 * @property {string} [hashAlg="sha2-256"] - The hash algorithm to be used over the serialized DAG node
 * @property {boolean} [pin=false] - Pin this node when adding to the blockstore
 * @property {boolean} [preload=true]
 * @property {number} [timeout] - A timeout in ms
 * @property {void} [cid]
 * @property {AbortSignal} [signal] - Can be used to cancel any long running requests started as a result of this call.
 *
 * @typedef {Object} PutWithCID
 * @property {CID} cid - The IPLD format multicodec
 * @property {boolean} [pin=false] - Pin this node when adding to the blockstore
 * @property {boolean} [preload=true]
 * @property {number} [timeout] - A timeout in ms
 * @property {AbortSignal} [signal] - Can be used to cancel any long running requests started as a result of this call.
 */

/**
 * @class
 * @extends {Client<API>}
 */
class DAG extends Client {
  /**
   * @param {Transport} transport
   */
  constructor (transport) {
    super('dag', ['put', 'get', 'tree'], transport)
  }

  /**
   * @param {JSONValue} dagNode
   * @param {Object} [options]
   * @param {string} [options.format="dag-cbor"] - The IPLD format multicodec
   * @param {string} [options.hashAlg="sha2-256"] - The hash algorithm to be used over the serialized DAG node
   * @param {CID} [options.cid]
   * @param {boolean} [options.pin=false] - Pin this node when adding to the blockstore
   * @param {boolean} [options.preload=true]
   * @param {number} [options.timeout] - A timeout in ms
   * @param {AbortSignal} [options.signal] - Can be used to cancel any long running requests started as a result of this call.
   * @returns {Promise<CID>}
   */
  async put (dagNode, options = {}) {
    const { format, hashAlg, cid, pin, preload, timeout, signal } = options

    const encodedCID = await this.remote.put({
      dagNode,
      format,
      hashAlg,
      cid: cid != null ? cid.toString() : undefined,
      pin,
      preload,
      timeout,
      signal
    })

    return new CID(encodedCID)
  }

  /**
   * @param {CID} cid
   * @param {string} [path]
   * @param {Object} [options]
   * @param {boolean} [options.localResolve]
   * @param {number} [options.timeout]
   * @param {AbortSignal} [options.signal]
   * @returns {Promise<{value:JSONValue, remainderPath:string}>}
   */
  get (cid, path, options = {}) {
    const [nodePath, { localResolve, timeout, signal }] = read(path, options)

    return this.remote.get({
      cid: cid.toString(),
      path: nodePath,
      localResolve,
      timeout,
      signal
    })
  }

  /**
   * Enumerate all the entries in a graph
   * @param {CID} cid - CID of the DAG node to enumerate
   * @param {string} [path]
   * @param {Object} [options]
   * @param {boolean} [options.recursive]
   * @param {number} [options.timeout]
   * @param {AbortSignal} [options.signal]
   * @returns {AsyncIterable<string>}
   */
  async * tree (cid, path, options = {}) {
    const [nodePath, { recursive, timeout, signal }] = read(path, options)

    const paths = await this.remote.tree({
      cid: cid.toString(),
      path: nodePath,
      recursive,
      timeout,
      signal
    })

    yield * paths
  }
}

/**
 * @template T
 * @typedef {T|void|null} Maybe
 */

/**
 * Takes logical parameters in form of [path, options] where both `path` and
 * `options` may be absent and returns normilized version where both `path`
 * and `options` are present. Uses `/` for `path` when missing and uses
 * `defaultOptions` when `options` are missing.
 * @template T
 * param {[Maybe<string>, T]|[NonNullable<T>, T]} params
 * @param {Maybe<string>|NonNullable<T>} path
 * @param {T} options
 * @returns {[string, T]}
 */
const read = (path, options) => {
  if (typeof path === 'string') {
    return [path, options]
  } else {
    return ['/', path == null ? options : path]
  }
}

module.exports = DAG
