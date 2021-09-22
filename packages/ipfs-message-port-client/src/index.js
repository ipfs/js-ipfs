
/* eslint-env browser */

import { MessageTransport } from './client/transport.js'
import { BlockClient } from './block.js'
import { DAGClient } from './dag.js'
import { CoreClient } from './core.js'
import { FilesClient } from './files.js'
export class IPFSClient extends CoreClient {
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
