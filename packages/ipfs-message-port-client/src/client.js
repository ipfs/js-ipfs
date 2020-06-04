'use strict'

/* eslint-env browser */

class RemoteError extends Error {
  /**
   *
   * @param {Object} info
   * @param {string} info.message
   * @param {string} info.stack
   * @param {string} info.name
   * @param {string} [info.code]
   */
  constructor ({ message, stack, name, code }) {
    super(message)
    this.stack = stack
    this.name = name
    if (code) {
      this.code = code
    }
  }
}

class TimeoutError extends Error {}

class AbortError extends Error {}

class DisconnectError extends Error {}

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
 * @template I,O
 * @class
 */
class Query {
  /**
   * @param {string} namespace
   * @param {string} method
   * @param {QueryInput<I>} input
   */
  constructor (namespace, method, input) {
    /** @type {Promise<O>} */
    this.result = new Promise((resolve, reject) => {
      this.succeed = resolve
      this.fail = reject
      this.abortController = new AbortController()
      this.signal = this.abortController.signal
      this.input = input
      this.namespace = namespace
      this.method = method
      this.timeout = Infinity
    })
  }

  /**
   * @returns {Object}
   */
  toJSON () {
    return this.input
  }

  /**
   * @returns {Transferable[]}
   */
  transfer () {
    return this.input.transfer
  }

  abort () {
    this.abortController.abort()
    this.fail(new AbortError())
  }
}

/** @typedef {Transport} ClientTransport */
class Transport {
  /**
   * Create transport for the underlying message port.
   * @param {MessagePort} [port]
   */
  constructor (port) {
    this.port = null
    this.nextID = 0
    this.id = Math.random()
      .toString(32)
      .slice(2)
    /** @type {Record<string, Query<any, any>>} */
    this.queries = Object.create(null)
    if (port) {
      this.connect(port)
    }
  }

  /**
   * @template I, O
   * @param {Query<I, O>} query
   * @returns {Promise<O>}
   */
  execute (query) {
    const id = `${this.id}@${this.nextID++}`
    this.queries[id] = query

    if (query.timeout > 0 && query.timeout < Infinity) {
      setTimeout(Transport.timeout, query.timeout, this, id)
    }

    query.signal.addEventListener('abort', () => this.abort(id), { once: true })

    if (this.port) {
      Transport.postQuery(this.port, id, query)
    }

    return query.result
  }

  /**
   * @param {Transport} self
   * @param {string} id
   */
  static timeout (self, id) {
    const { queries } = self
    const query = queries[id]
    if (query) {
      self.abort(id)
      query.fail(new TimeoutError())
    }
  }

  /**
   *
   * @param {string} id
   */
  abort (id) {
    const query = this.queries[id]
    if (query) {
      delete this.queries[id]
      if (this.port) {
        this.port.postMessage({ type: 'abort', id })
      }
    }
  }

  /**
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
   * @param {MessagePort} port
   */
  connect (port) {
    if (this.port) {
      throw new RangeError('Transport is already open')
    } else {
      this.port = port
      this.port.addEventListener('message', this)
      this.port.start()
      for (const [id, query] of Object.entries(this.queries)) {
        Transport.postQuery(port, id, query)
      }
    }
  }

  disconnect () {
    if (this.port) {
      const error = new DisconnectError()
      for (const [id, query] of Object.entries(this.queries)) {
        query.fail(error)
        this.abort(id)
      }
      this.port.removeEventListener('message', this)
      this.port.close()
    }
  }

  /**
   * @param {MessageEvent} event
   */
  handleEvent (event) {
    const { id, result } = event.data
    const query = this.queries[id]
    if (query) {
      delete this.queries[id]
      if (result.ok) {
        query.succeed(result.value)
      } else {
        query.fail(new RemoteError(result.error))
      }
    } else {
      throw new RangeError(`Received response${id} for unknown query`)
    }
  }
}

/**
 * @template T
 * @typedef {Array<keyof T>} Keys
 */

/**
 * @template T
 * @typedef {Remote<T> & Service<T>} RemoteService
 */

/**
 * @template T
 */
class Service {
  /**
   * @param {string} namespace
   * @param {ProcedureNames<T>} methods
   * @param {Transport} transport
   */
  constructor (namespace, methods, transport) {
    this.transport = transport
    /** @type {any} */
    const self = (this)
    for (const method of methods) {
      /**
       * @template I, O
       * @param {I} input
       * @returns {Promise<O>}
       */
      self[method] = input =>
        this.transport.execute(new Query(namespace, method.toString(), input))
    }
  }
}

/**
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

module.exports = { Client, Transport, RemoteError, AbortError, DisconnectError }
