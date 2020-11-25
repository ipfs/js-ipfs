'use strict'
/* eslint-env browser */

const MessageTransport = require('./client/transport')
const BlockClient = require('./block')
const DAGClient = require('./dag')
const CoreClient = require('./core')
const FilesClient = require('./files')

/**
 * @typedef {import('./client').MessageTransport} MessageTransport
 *
 * @typedef {Object} ClientOptions
 * @property {MessagePort} port
 */

class IPFSClient extends CoreClient {
  /**
   * @param {MessageTransport} transport
   */
  constructor (transport) {
    super(transport)
    this.transport = transport
    this.dag = new DAGClient(this.transport)
    this.files = new FilesClient(this.transport)
    this.block = new BlockClient(this.transport)
  }

  /**
   * Attaches IPFS client to the given message port. Throws
   * exception if client is already attached.
   *
   * @param {IPFSClient} self
   * @param {MessagePort} port
   */
  static attach (self, port) {
    self.transport.connect(port)
  }

  /**
   * Creates IPFS client that is detached from the `ipfs-message-port-service`.
   * This can be useful when in a scenario where obtaining message port happens
   * later on in the application logic. Datached IPFS client will queue all the
   * API calls and flush them once client is attached.
   *
   * @returns {IPFSClient}
   */
  static detached () {
    return new IPFSClient(new MessageTransport(undefined))
  }

  /**
   * Creates IPFS client from the message port (assumes that
   * `ipfs-message-port-service` is instantiated on the other end)
   *
   * @param {MessagePort} port
   * @returns {IPFSClient}
   */
  static from (port) {
    return new IPFSClient(new MessageTransport(port))
  }
}

module.exports = IPFSClient

/**
 * @typedef {Object} MessagePortOptions
 * @property {Array} [transfer] - A list of ArrayBuffers whose ownership will be transferred to the shared worker
 *
 * @typedef {import('ipfs-core/src/utils').AbortOptions} AbortOptions}
 */

/**
 * This is an utility type that can be used to derive type of the HTTP Client
 * API from the Core API. It takes type of the API factory (from ipfs-core),
 * derives API from it's return type and extends it last `options` parameter
 * with `HttpOptions`.
 *
 * This can be used to avoid (re)typing API interface when implementing it in
 * http client e.g you can annotate `ipfs.addAll` implementation with
 *
 * `@type {Implements<typeof import('ipfs-core/src/components/add-all')>}`
 *
 * **Caution**: This supports APIs with up to four parameters and last optional
 * `options` parameter, anything else will result to `never` type.
 *
 * @template {(config:any) => any} APIFactory
 * @typedef {APIWithExtraOptions<ReturnType<APIFactory>, MessagePortOptions>} Implements
 */

/**
 * @template Key
 * @template {(config:any) => any} APIFactory
 * @typedef {import('./interface').APIMethodWithExtraOptions<ReturnType<APIFactory>, Key, MessagePortOptions>} ImplementsMethod
 */

/**
 * @template API, Extra
 * @typedef {import('./interface').APIWithExtraOptions<API, Extra>} APIWithExtraOptions
 */
