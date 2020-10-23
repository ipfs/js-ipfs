'use strict'

/* eslint-env browser */

const Service = require('./client/service')

/**
 * @template T
 * @typedef {import('ipfs-message-port-protocol/src/rpc').Remote<T>} Remote
 */

/**
 * @template T
 * @typedef {import('ipfs-message-port-protocol/src/rpc').ProcedureNames<T>} ProcedureNames
 */

/**
 * @template T
 * @typedef {Array<keyof T>} Keys
 */

/**
 * @template T
 * @typedef {Remote<T> & Service<T>} RemoteService
 */

/**
 * Client represents the client to remote `T` service. It is a base clase that
 * specific API clients will subclass to provide a higher level API for end
 * user. Client implementations take care of encoding arguments into quries
 * and issing those to `remote` service.
 *
 * @class
 * @template T
 */
module.exports = class Client {
  /**
   * @param {string} namespace
   * @param {ProcedureNames<T>} methods
   * @param {MessageTransport} transport
   */
  constructor (namespace, methods, transport) {
    /** @type {RemoteService<T>} */
    this.remote = (new Service(namespace, methods, transport))
  }
}

/**
 * @typedef {import('./client/transport')} MessageTransport
 */
