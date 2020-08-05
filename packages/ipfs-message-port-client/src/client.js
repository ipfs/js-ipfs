'use strict'

/* eslint-env browser */
const { decodeError } = require('ipfs-message-port-protocol/src/error')

/**
 * @template T
 * @typedef {import('ipfs-message-port-protocol/src/rpc').Remote<T>} Remote
 */

/**
 * @template T
 * @typedef {import('ipfs-message-port-protocol/src/rpc').ProcedureNames<T>} ProcedureNames
 */

/**
 * @typedef {Object} QueryOptions
 * @property {AbortSignal} [signal]
 * @property {number} [timeout]
 * @property {Transferable[]} [transfer]
 */

/**
 * @template I
 * @typedef {I & QueryOptions} QueryInput
 */

/**
 * Represents server query, encapsulating inputs to the server endpoint and
 * promise of it's result.
 *
 * @template I,O
 * @class
 */
class Query {
  /**
   * @param {string} namespace - component namespace on the server.
   * @param {string} method - remote method this is a query of.
   * @param {QueryInput<I>} input - query input.
   */
  constructor (namespace, method, input) {
    /** @type {Promise<O>} */
    this.result = new Promise((resolve, reject) => {
      this.succeed = resolve
      this.fail = reject
      this.signal = input.signal
      this.input = input
      this.namespace = namespace
      this.method = method
      this.timeout = input.timeout == null ? Infinity : input.timeout
      /** @type {number|null} */
      this.timerID = null
    })
  }

  /**
   * Data that will be structure cloned over message channel.
   * @returns {Object}
   */
  toJSON () {
    return this.input
  }

  /**
   * Data that will be transferred over message channel.
   * @returns {Transferable[]}
   */
  transfer () {
    return this.input.transfer
  }
}

/** @typedef {Transport} ClientTransport */

/**
 * RPC Transport over `MessagePort` that can execute queries. It takes care of
 * executing queries by issuing a message with unique ID and fullfilling a
 * query when corresponding response message is received. It also makes sure
 * that aborted / timed out queries are cancelled as needed.
 *
 * It is expected that there will be at most one transport for a message port
 * instance.
 * @class
 */
class Transport {
  /**
   * Create transport for the underlying message port.
   * @param {MessagePort} [port]
   */
  constructor (port) {
    this.port = null
    // Assigining a random enough identifier to the transport, to ensure that
    // query.id will be unique when multiple tabs are communicating with a
    // a server in the SharedWorker.
    this.id = Math.random()
      .toString(32)
      .slice(2)

    // Local unique id on the transport which is incremented for each query.
    this.nextID = 0

    // Dictionary of pending requests
    /** @type {Record<string, Query<any, any>>} */
    this.queries = Object.create(null)

    // If port is provided connect this transport to it. If not transport can
    // queue queries and execute those once it's connected.
    if (port) {
      this.connect(port)
    }
  }

  /**
   * Executes given query with this transport and returns promise for it's
   * result. Promise fails with an error if query fails.
   *
   * @template I, O
   * @param {Query<I, O>} query
   * @returns {Promise<O>}
   */
  execute (query) {
    const id = `${this.id}@${this.nextID++}`
    this.queries[id] = query

    // If query has a timeout set a timer.
    if (query.timeout > 0 && query.timeout < Infinity) {
      query.timerID = setTimeout(Transport.timeout, query.timeout, this, id)
    }

    if (query.signal) {
      query.signal.addEventListener('abort', () => this.abort(id), {
        once: true
      })
    }

    // If transport is connected (it has port) post a query, otherwise it
    // will remain in the pending queries queue.
    if (this.port) {
      Transport.postQuery(this.port, id, query)
    }

    return query.result
  }

  /**
   * Connects this transport to the given message port. Throws `Error` if
   * transport is already connected. All the pending queries will be executed
   * as connection occurs.
   *
   * @param {MessagePort} port
   */
  connect (port) {
    if (this.port) {
      throw new Error('Transport is already open')
    } else {
      this.port = port
      this.port.addEventListener('message', this)
      this.port.start()

      // Go ever pending queries (that were submitted before transport was
      // connected) and post them. This loop is safe because messages will not
      // arrive while this loop is running so no mutation can occur.
      for (const [id, query] of Object.entries(this.queries)) {
        Transport.postQuery(port, id, query)
      }
    }
  }

  /**
   * Disconnects this transport. This will cause all the pending queries
   * to be aborted and undelying message port to be closed.
   *
   * Once disconnected transport can not be reconnected back.
   */
  disconnect () {
    const error = new DisconnectError()
    for (const [id, query] of Object.entries(this.queries)) {
      query.fail(error)
      this.abort(id)
    }

    // Note that reference to port is kept that ensures that attempt to
    // reconnect will throw an error.
    if (this.port) {
      this.port.removeEventListener('message', this)
      this.port.close()
    }
  }

  /**
   * Invoked on query timeout. If query is still pending it will fail and
   * abort message will be send to a the server.
   *
   * @param {Transport} self
   * @param {string} id
   */
  static timeout (self, id) {
    const { queries } = self
    const query = queries[id]
    if (query) {
      delete queries[id]
      query.fail(new TimeoutError('request timed out'))
      if (self.port) {
        self.port.postMessage({ type: 'abort', id })
      }
    }
  }

  /**
   * Aborts this query by failing with `AbortError` and sending an abort message
   * to the server. If query is no longer pending this has no effect.
   * @param {string} id
   */
  abort (id) {
    const { queries } = this
    const query = queries[id]
    if (query) {
      delete queries[id]

      query.fail(new AbortError())
      if (this.port) {
        this.port.postMessage({ type: 'abort', id })
      }

      if (query.timerID != null) {
        clearTimeout(query.timerID)
      }
    }
  }

  /**
   * Sends a given `query` with a given `id` over the message channel.
   * @param {MessagePort} port
   * @param {string} id
   * @param {Query<any, any>} query
   */
  static postQuery (port, id, query) {
    port.postMessage(
      {
        type: 'query',
        namespace: query.namespace,
        method: query.method,
        id,
        input: query.toJSON()
      },
      query.transfer()
    )
  }

  /**
   * Handler is invoked when message on the message port is received.
   * @param {MessageEvent} event
   */
  handleEvent (event) {
    const { id, result } = event.data
    const query = this.queries[id]
    // If query with a the given ID is found it is completed with the result,
    // otherwise it is cancelled.
    // Note: query may not be found when it was aborted on the client and at the
    // same time server posted response.
    if (query) {
      delete this.queries[id]
      if (result.ok) {
        query.succeed(result.value)
      } else {
        query.fail(decodeError(result.error))
      }

      if (query.timerID != null) {
        clearTimeout(query.timerID)
      }
    }
  }
}
exports.Transport = Transport

/**
 * @template T
 * @typedef {Array<keyof T>} Keys
 */

/**
 * @template T
 * @typedef {Remote<T> & Service<T>} RemoteService
 */

/**
 * Service represents an API to a remote service `T`. It will have all the
 * methods with the same signatures as `T`.
 *
 * @class
 * @template T
 */
class Service {
  /**
   * @param {string} namespace - Namespace that remote API is served under.
   * @param {ProcedureNames<T>} methods - Method names of the remote API.
   * @param {Transport} transport - Transport to issue queries over.
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
 * Client represents the client to remote `T` service. It is a base clase that
 * specific API clients will subclass to provide a higher level API for end
 * user. Client implementations take care of encoding arguments into quries
 * and issing those to `remote` service.
 *
 * @class
 * @template T
 */
class Client {
  /**
   * @param {string} namespace
   * @param {ProcedureNames<T>} methods
   * @param {Transport} transport
   */
  constructor (namespace, methods, transport) {
    /** @type {RemoteService<T>} */
    this.remote = (new Service(namespace, methods, transport))
  }
}
exports.Client = Client

class TimeoutError extends Error {
  get name () {
    return this.constructor.name
  }
}
exports.TimeoutError = TimeoutError

class AbortError extends Error {
  get name () {
    return this.constructor.name
  }
}
exports.AbortError = AbortError

class DisconnectError extends Error {
  get name () {
    return this.constructor.name
  }
}
exports.DisconnectError = DisconnectError
