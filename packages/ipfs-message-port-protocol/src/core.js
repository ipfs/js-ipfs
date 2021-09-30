/* eslint-env browser */

import { encodeError, decodeError } from './error.js'

/**
 * @template T
 * @typedef {Object} RemoteIterable
 * @property {'RemoteIterable'} type
 * @property {MessagePort} port
 */

/**
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
export const decodeIterable = async function * ({ port }, decode) {
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

/**
 * @template I,O
 * @param {AsyncIterable<I>|Iterable<I>} iterable
 * @param {function(I, Set<Transferable>):O} encode
 * @param {Set<Transferable>} transfer
 * @returns {RemoteIterable<O>}
 */
export const encodeIterable = (iterable, encode, transfer) => {
  const { port1: port, port2: remote } = new MessageChannel()
  /** @type {Iterator<I>|AsyncIterator<I>} */
  const iterator = toIterator(iterable)
  // Note that port.onmessage will receive multiple 'next' method messages.
  // Instead of allocating set every time we allocate one here and recycle
  // it on each 'next' message.
  /** @type {Set<Transferable>} */
  const itemTransfer = new Set()

  port.onmessage = async ({ data: { method } }) => {
    switch (method) {
      case 'next': {
        try {
          const { done, value } = await iterator.next()
          if (done) {
            port.postMessage({ type: 'next', done: true })
            port.close()
          } else {
            itemTransfer.clear()
            const encodedValue = encode(value, itemTransfer)

            postMessage(
              port,
              {
                type: 'next',
                done: false,
                value: encodedValue
              },
              itemTransfer
            )
          }
        } catch (/** @type {any} */ error) {
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
  transfer.add(remote)

  return { type: 'RemoteIterable', port: remote }
}

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
 * @param {Function} callback
 * @param {Set<Transferable>} transfer
 * @returns {RemoteCallback}
 */
export const encodeCallback = (callback, transfer) => {
  // eslint-disable-next-line no-undef
  const { port1: port, port2: remote } = new MessageChannel()
  port.onmessage = ({ data }) => callback.apply(null, data)
  transfer.add(remote)
  return { type: 'RemoteCallback', port: remote }
}

/**
 * @template T
 * @param {RemoteCallback} remote
 * @returns {function(T[]):void | function(T[], Set<Transferable>):void}
 */
export const decodeCallback = ({ port }) => {
  /**
   * @param {T[]} args
   * @param {Set<Transferable>} [transfer]
   * @returns {void}
   */
  const callback = (args, transfer) => {
    postMessage(port, args, transfer)
  }

  return callback
}

/**
 * @param {MessagePort} port
 * @param {any} message
 * @param {Iterable<Transferable>} [transfer]
 */
const postMessage = (port, message, transfer) =>
  // @ts-expect-error - Built in types expect Transferable[] but it really
  // should be Iterable<Transferable>
  port.postMessage(message, transfer)
