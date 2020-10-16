'use strict'

const Query = require('./query')

/**
 * Service represents an API to a remote service `T`. It will have all the
 * methods with the same signatures as `T`.
 *
 * @template T
 */
module.exports = class Service {
  /**
   * @param {string} namespace - Namespace that remote API is served under.
   * @param {ProcedureNames<T>} methods - Method names of the remote API.
   * @param {MessageTransport} transport - Transport to issue queries over.
   */
  constructor (namespace, methods, transport) {
    this.transport = transport
    // Type script does not like using classes as some dicitionaries, so
    // we explicitly type it as dictionary.
    /** @type {Object.<ProcedureNames<T>, Function>} */
    const api = this
    for (const method of methods) {
      /**
       * @template I, O
       * @param {I} input
       * @returns {Promise<O>}
       */
      api[method] = input =>
        this.transport.execute(new Query(namespace, method.toString(), input))
    }
  }
}

/**
 * @typedef {import('./transport')} MessageTransport
 */
/**
 * @template T
 * @typedef {import('ipfs-message-port-protocol/src/rpc').ProcedureNames<T>} ProcedureNames
 */
