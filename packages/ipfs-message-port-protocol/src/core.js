'use strict'

// import {
//   HashAlg,
//   RemoteCallback,
//   Time,
//   Mode,
//   StringEncoded,
//   UnixFSTime,
//   FileType
// } from 'ipfs-message-port-protocol/src/data'

/**
 * @template T
 * @typedef {import("./data").RemoteIterable<T>} RemoteIterable
 */

/**
 * @template T
 * @typedef {import('./data').RemoteCallback<T>} RemoteCallback
 */

/**
 * @template T
 * @param {RemoteIterable<T>} remote
 * @returns {AsyncIterable<T>}
 */
const decodeRemoteIterable = async function * ({ port }) {
  /**
   * @param {{done:false, value:T}|{done:true, value:void}} _data
   * @returns {void}
   */
  let receive = _data => {}
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

  const abort = () => {
    port.postMessage({ method: 'return' })
    port.close()
  }

  let isDone = false
  try {
    while (!isDone) {
      const { done, value } = await next()
      isDone = done
      if (!done) {
        yield value
      }
    }
  } finally {
    if (!isDone) {
      abort()
    }
  }
}
exports.decodeRemoteIterable = decodeRemoteIterable

/**
 * @template T
 * @param {AsyncIterable<T>} iterable
 * @returns {RemoteIterable<T>}
 */
const encodeAsyncIterable = iterable => {
  // eslint-disable-next-line no-undef
  const { port1: port, port2: remote } = new MessageChannel()
  const iterator = iterable[Symbol.asyncIterator]()
  port.onmessage = async ({ data: { method } }) => {
    switch (method) {
      case 'next': {
        const { done, value } = await iterator.next()
        if (done) {
          port.postMessage({ done: true })
          port.close()
        } else {
          port.postMessage({ done: false, value })
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

  return { type: 'RemoteIterable', port: remote, transfer: [remote] }
}
exports.encodeAsyncIterable = encodeAsyncIterable

/**
 * @template T
 * @param {function(T):void} callback
 * @returns {RemoteCalback<T>}
 */
const encodeCallback = callback => {
  // eslint-disable-next-line no-undef
  const { port1: port, port2: remote } = new MessageChannel()
  port.onmessage = ({ data }) => callback(data)
  return { type: 'RemoteCallback', port: remote }
}
exports.encodeCallback = encodeCallback

/**
 * @template A,B
 * @param {AsyncIterable<A>} source
 * @param {function(A): B} f
 * @returns {AsyncIterable<B>}
 */
const mapAsyncIterable = async function * (source, f) {
  for await (const item of source) {
    yield f(item)
  }
}
exports.mapAsyncIterable = mapAsyncIterable
