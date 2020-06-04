'use strict'

/* eslint-env browser */

// const CID = require('cids')

/**
 * @typedef {import('./ipfs').IPFS} IPFS
 * @typedef {import('ipfs-message-port-protocol/src/data').EncodedError} EncodedError
 */

/**
 * @template X, T
 * @typedef {import('ipfs-message-port-protocol/src/data').Result<X, T>} Result
 */

/**
 * @template T
 * @typedef {import('ipfs-message-port-protocol/src/rpc').Input<T>} Input
 */

/**
 * @template T
 * @typedef {import('ipfs-message-port-protocol/src/rpc').ProcedureNames<T>} ProcedureNames
 */

/**
 * @template T
 * @typedef {import('ipfs-message-port-protocol/src/rpc').Method<T>} Method
 */

/**
 * @template T
 * @typedef {import('ipfs-message-port-protocol/src/rpc').Namespace<T>} Namespace
 */

/**
 * @template T
 * @typedef {import('ipfs-message-port-protocol/src/rpc').ServiceQuery<T>} ServiceQuery
 */

/**
 * @template T
 * @typedef {import('ipfs-message-port-protocol/src/rpc').RPCQuery<T>} RPCQuery

 */

/**
 * @template T
 * @typedef {import('ipfs-message-port-protocol/src/rpc').Inn<T>} Inn
 */

/**
 * @template T
 * @typedef {import('ipfs-message-port-protocol/src/rpc').Out<T>} Out
 */

/**
 * @template T
 * @typedef {Object} QueryMessage
 * @property {'query'} type
 * @property {Namespace<T>} namespace
 * @property {Method<T>} method
 * @property {string} id
 * @property {Inn<T>} input
 */

/**
 * @typedef {Object} AbortMessage
 * @property {'abort'} type
 * @property {string} id
 */

/**
 * @typedef {Object} TransferOptions
 * @property {Transferable[]} [transfer]
 */

/**
 * @template O
 * @typedef {O & TransferOptions} QueryResult
 */

/**
 * @template T
 * @typedef {AbortMessage|QueryMessage<T>} Message
 */

/**
 * @template T
 * @typedef {import('ipfs-message-port-protocol/src/rpc').Service<T>} Service
 */

/**
 * @template T, K
 * @typedef {import('ipfs-message-port-protocol/src/rpc').NamespacedQuery<T, K>} NamespacedQuery
 */
/**
 * @template T
 * @extends {ServiceQuery<T>}
 * @implements {ServiceQuery<T>}
 */
class Query {
  /**
   * @param {Namespace<T>} namespace
   * @param {Method<T>} method
   * @param {Inn<T>} input
   */
  constructor (namespace, method, input) {
    this.result = new Promise((resolve, reject) => {
      this.succeed = resolve
      this.fail = reject
      this.namespace = namespace
      this.method = method
      this.input = input

      this.abortController = new AbortController()
      this.signal = this.abortController.signal
    })
  }

  /**
   * @template T
   * @param {RPCQuery<T>} value
   * @returns {Query<T>}
   */
  static from (value) {
    return new Query(value.namespace, value.method, value.input)
  }

  abort () {
    this.abortController.abort()
    this.fail(new AbortError())
  }
}

/**
 * @template T
 */

class Server {
  /**
   * @param {Service<T>} services
   */
  constructor (services) {
    this.services = services
    /** @type {Record<string, Query<T>>} */
    this.queries = Object.create(null)
  }

  /**
   * @param {MessagePort} port
   */
  connect (port) {
    port.addEventListener('message', this)
    port.start()
  }

  /**
   * @param {MessagePort} port
   */
  disconnect (port) {
    port.removeEventListener('message', this)
    port.close()
  }

  /**
   * @param {MessageEvent} event
   * @returns {void}
   */
  handleEvent (event) {
    /** @type {Message<T>} */
    const data = event.data
    switch (data.type) {
      case 'query': {
        this.handleQuery(
          data.id,
          new Query(data.namespace, data.method, data.input),
          /** @type {MessagePort} */
          (event.target)
        )
        return undefined
      }
      case 'abort': {
        return this.abort(data.id)
      }
      default: {
        throw new UnsupportedMessageError(event)
      }
    }
  }

  /**
   * @param {string} id
   */
  abort (id) {
    const query = this.queries[id]
    if (query) {
      delete this.queries[id]
      query.abort()
    }
  }

  /**
   * @param {string} id
   * @param {Query<T>} query
   * @param {MessagePort} port
   */
  async handleQuery (id, query, port) {
    this.queries[id] = query
    await this.run(query)
    delete this.queries[id]
    if (!query.signal.aborted) {
      try {
        const value = await query.result
        port.postMessage(
          { type: 'result', id, result: { ok: true, value } },
          value.transfer || []
        )
      } catch ({ name, message, stack, code }) {
        const error = { name, message, stack, code }
        port.postMessage({ type: 'result', id, result: { ok: false, error } })
      }
    }
  }

  /**
   * @param {Query<T>} query
   * @returns {void}
   */
  run (query) {
    const { services } = this
    const { namespace, method } = query

    // @ts-ignore - seems to fail to infer
    const service = namespace == null ? services : services[namespace]
    if (service) {
      const procedure = service[method]
      if (typeof procedure === 'function') {
        try {
          Promise.resolve(procedure.call(service, query.input)).then(
            query.succeed,
            query.fail
          )
        } catch (error) {
          query.fail(error)
        }
      } else {
        query.fail(new RangeError(`Method '${method}' is not found`))
      }
    } else {
      query.fail(new RangeError(`Namespace '${namespace}' is not found`))
    }
  }

  /**
   * @param {RPCQuery<T>} data
   * @returns {Out<T>}
   */
  execute (data) {
    const query = Query.from(data)
    this.execute(query)

    return query.result
  }
}

class UnsupportedMessageError extends RangeError {
  /**
   * @param {MessageEvent} event
   */
  constructor (event) {
    super('Unexpected message was received by the server')
    this.event = event
  }
}

class AbortError extends Error {}

exports.Query = Query
exports.Server = Server
exports.AbortError = AbortError
