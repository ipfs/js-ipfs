// @ts-nocheck
'use strict'
/* eslint-env browser */

const DAG = require('./dag')
const { Transport } = require('./client')

/**
 * @typedef {Object} ClientOptions
 * @property {MessagePort} port
 */

class IPFSClient {
  /**
   * @param {Transport} [transport]
   */
  constructor (transport) {
    this.transport = transport
    this.dag = new DAG(this.transport)
  }

  /**
   * Attaches IPFS client to the given message port. Throws
   * exception if client is already attached.
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
   * @returns {IPFSClient}
   */
  static detached () {
    return new IPFSClient(new Transport(null))
  }

  /**
   * Creates IPFS client from the message port (assumes that
   * `ipfs-message-port-service` is instantiated on the other end)
   * @param {MessagePort} port
   * @returns {IPFSClient}
   */
  static from (port) {
    return new IPFSClient(new Transport(port))
  }
}
/**
 *
 */
// class IPFSClient {
//   /**
//    * @param {ClientOptions} options
//    */
//   constructor (options) {
//     this.connection = new RPCConnection(options.port)
//   }
//   get files () {
//     const value = new FilesClient(this.connection)
//     Object.defineProperty(this, 'files', { value })
//     return value
//   }
// }
// Object.assign(IPFSClient.prototype, FilesTopClient.prototype)
// Object.assign(IPFSClient.prototype, FilesClient.prototype)

// // Object.assign(ipfsClient, { Buffer, CID, multiaddr, multibase, multicodec, multihash, globSource, urlSource })

module.exports = IPFSClient
