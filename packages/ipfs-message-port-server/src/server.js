
/* eslint-env browser */

import { encodeError } from 'ipfs-message-port-protocol/error'

/**
 * @typedef {import('ipfs-message-port-protocol/src/data').EncodedError} EncodedError
 */

/**
 * @template X, T
 * @typedef {import('ipfs-message-port-protocol/src/data').Result<X, T>} Result
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
 * @typedef {import('ipfs-message-port-protocol/src/rpc').Return<T>} Return
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
 * @property {Set<Transferable>} [transfer]
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
 * @template T, K
 * @typedef {import('ipfs-message-port-protocol/src/rpc').NamespacedQuery<T, K>} NamespacedQuery
 */

/**
 * Represents a client query received on the server.
 *
 * @template T
 * @extends {ServiceQuery<T>}
 */

export class Query {
  /**
   * @param {Namespace<T>} namespace
   * @param {Method<T>} method
   * @param {Inn<T>} input
   */
  constructor (namespace, method, input) {
    /** @type {Return<any>} */
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
   * Aborts this query if it is still pending.
   */
  abort () {
    this.abortController.abort()
    this.fail(new AbortError())
  }
}

/**
 * @template T
 * @typedef {import('ipfs-message-port-protocol/src/rpc').MultiService<T>} MultiService
 */

/**
 * Server wraps `T` service and executes queries received from connected ports.
 *
 * @template T
 */

export class Server {
  /**
   * @param {MultiService<T>} services
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
   * Handles messages received from connected clients
   *
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
   * Abort query for the given id.
   *
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
   * Handles query received from the client.
   *
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
        const transfer = value.transfer

        // Don't need the transfer value in the result
        delete value.transfer

        port.postMessage(
          { type: 'result', id, result: { ok: true, value } },
          transfer
        )
      } catch (/** @type {any} */ error) {
        port.postMessage({
          type: 'result',
          id,
          result: { ok: false, error: encodeError(error) }
        })
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

    const service = services[namespace]
    if (service) {
      if (typeof service[method] === 'function') {
        try {
          const result = service[method]({ ...query.input, signal: query.signal })
          Promise.resolve(result).then(query.succeed, query.fail)
        } catch (/** @type {any} */ error) {
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
    const query = new Query(data.namespace, data.method, data.input)
    this.run(query)

    return query.result
  }
}

export class UnsupportedMessageError extends RangeError {
  /**
   * @param {MessageEvent} event
   */
  constructor (event) {
    super('Unexpected message was received by the server')
    this.event = event
  }

  get name () {
    return this.constructor.name
  }
}

export const AbortError = class AbortError extends Error {
  get name () {
    return this.constructor.name
  }
}
