// @ts-nocheck
'use strict'
/* eslint-env browser */

const DAG = require('./dag')
const Core = require('./core')
const { Transport } = require('./client')

/**
 * @typedef {Object} ClientOptions
 * @property {MessagePort} port
 */

class IPFSClient extends Core {
  /**
   * @param {Transport} [transport]
   */
  constructor (transport) {
    super(transport)
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

module.exports = IPFSClient
