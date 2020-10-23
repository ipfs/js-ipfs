'use strict'

const { decodeError } = require('ipfs-message-port-protocol/src/error')
const { DisconnectError, TimeoutError, AbortError } = require('./error')

/**
 * RPC Transport over `MessagePort` that can execute queries. It takes care of
 * executing queries by issuing a message with unique ID and fullfilling a
 * query when corresponding response message is received. It also makes sure
 * that aborted / timed out queries are cancelled as needed.
 *
 * It is expected that there will be at most one transport for a message port
 * instance.
 *
 */
module.exports = class MessageTransport {
  /**
   * Create transport for the underlying message port.
   *
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
      query.timerID = setTimeout(MessageTransport.timeout, query.timeout, this, id)
    }

    if (query.signal) {
      query.signal.addEventListener('abort', () => this.abort(id), {
        once: true
      })
    }

    // If transport is connected (it has port) post a query, otherwise it
    // will remain in the pending queries queue.
    if (this.port) {
      MessageTransport.postQuery(this.port, id, query)
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
        MessageTransport.postQuery(port, id, query)
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
   * @param {MessageTransport} self
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
   *
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
   *
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
      // @ts-ignore - TS seems to want second arg to postMessage to not be undefined
      query.transfer()
    )
  }

  /**
   * Handler is invoked when message on the message port is received.
   *
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

/**
 * @template I,O
 * @typedef {import('./query')<I, O>} Query
 */
