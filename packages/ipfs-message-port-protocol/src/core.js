'use strict'

/* eslint-env browser */
const { encodeError, decodeError } = require('./error')

/**
 * @template T
 * @typedef {Object} RemoteIterable
 * @property {'RemoteIterable'} type
 * @property {MessagePort} port
 */

/**
 * @template T
 * @typedef {Object} RemoteCallback
 * @property {'RemoteCallback'} type
 * @property {MessagePort} port
 */

/**
 * @template T
 * @typedef {Object} RemoteYield
 * @property {false} done
 * @property {T} value
 * @property {void} error
 */

/**
 * @template T
 * @typedef {Object} RemoteDone
 * @property {true} done
 * @property {T|void} value
 * @property {void} error
 */

/**
 * @typedef {import('./error').EncodedError} EncodedError
 * @typedef {Object} RemoteError
 * @property {true} done
 * @property {void} value
 * @property {EncodedError} error
 */

/**
 * @template T
 * @typedef {RemoteYield<T>|RemoteDone<T>|RemoteError} RemoteNext
 */

/**
 * @template I, O
 * @param {RemoteIterable<I>} remote
 * @param {function(I):O} decode
 * @returns {AsyncIterable<O>}
 */
const decodeIterable = async function * ({ port }, decode) {
  /**
   * @param {RemoteNext<I>} _data
   */
  let receive = _data => {}
  /**
   * @returns {Promise<RemoteNext<I>>}
   */
  const wait = () => new Promise(resolve => (receive = resolve))
  const next = () => {
    port.postMessage({ method: 'next' })
    return wait()
  }

  /**
   * @param {MessageEvent} event
   * @returns {void}
   */
  port.onmessage = event => receive(event.data)

  let isDone = false
  try {
    while (!isDone) {
      const { done, value, error } = await next()
      isDone = done
      if (error != null) {
        throw decodeError(error)
      } else if (value != null) {
        yield decode(value)
      }
    }
  } finally {
    if (!isDone) {
      port.postMessage({ method: 'return' })
    }
    port.close()
  }
}
exports.decodeIterable = decodeIterable

/**
 * @template I,O
 * @param {AsyncIterable<I>|Iterable<I>} iterable
 * @param {function(I, Transferable[]):O} encode
 * @param {Transferable[]} transfer
 * @returns {RemoteIterable<O>}
 */
const encodeIterable = (iterable, encode, transfer) => {
  const { port1: port, port2: remote } = new MessageChannel()
  /** @type {Transferable[]} */
  const itemTransfer = []
  /** @type {Iterator<I>|AsyncIterator<I>} */
  const iterator = toIterator(iterable)

  port.onmessage = async ({ data: { method } }) => {
    switch (method) {
      case 'next': {
        try {
          const { done, value } = await iterator.next()
          if (done) {
            port.postMessage({ type: 'next', done: true })
            port.close()
          } else {
            itemTransfer.length = 0
            port.postMessage(
              {
                type: 'next',
                done: false,
                value: encode(value, itemTransfer)
              },
              itemTransfer
            )
          }
        } catch (error) {
          port.postMessage({
            type: 'throw',
            error: encodeError(error)
          })
          port.close()
        }
        break
      }
      case 'return': {
        port.close()
        if (iterator.return) {
          iterator.return()
        }
        break
      }
      default: {
        break
      }
    }
  }
  port.start()
  transfer.push(remote)

  return { type: 'RemoteIterable', port: remote }
}
exports.encodeIterable = encodeIterable

/**
 * @template I
 * @param {any} iterable
 * @returns {Iterator<I>|AsyncIterator<I>}
 */
const toIterator = iterable => {
  if (iterable != null) {
    if (typeof iterable[Symbol.asyncIterator] === 'function') {
      return iterable[Symbol.asyncIterator]()
    }

    if (typeof iterable[Symbol.iterator] === 'function') {
      return iterable[Symbol.iterator]()
    }
  }

  throw TypeError('Value must be async or sync iterable')
}

/**
 * @template T
 * @param {function(T):void} callback
 * @param {Transferable[]} transfer
 * @returns {RemoteCallback<T>}
 */
const encodeCallback = (callback, transfer) => {
  // eslint-disable-next-line no-undef
  const { port1: port, port2: remote } = new MessageChannel()
  port.onmessage = ({ data }) => callback(data)
  transfer.push(remote)
  return { type: 'RemoteCallback', port: remote }
}
exports.encodeCallback = encodeCallback

/**
 * @template T
 * @param {RemoteCallback<T>} remote
 * @returns {function(T):void | function(T, Transferable[]):void}
 */
const decodeCallback = ({ port }) => {
  /**
   * @param {T} value
   * @param {Transferable[]} [transfer]
   * @returns {void}
   */
  const callback = (value, transfer = []) => {
    port.postMessage(value, transfer)
  }

  return callback
}
exports.decodeCallback = decodeCallback
