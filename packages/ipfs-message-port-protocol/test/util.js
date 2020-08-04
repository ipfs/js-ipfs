'use strict'
/* eslint-env browser */

const ipc = () => {
  const { port1: sender, port2: receiver } = new MessageChannel()
  let out = true
  const move = async (data, transfer) => {
    await out
    return await new Promise(resolve => {
      receiver.onmessage = event => resolve(event.data)
      sender.postMessage(data, transfer)
    })
  }

  /**
   * @template T
   * @param {T} data
   * @param {Transferable[]} [transfer]
   * @returns {Promise<T>}
   */
  const ipcMove = async (data, transfer = []) => {
    out = move(data, transfer)
    return await out
  }

  return ipcMove
}
exports.ipc = ipc

/**
 * @returns {[Promise<T>, function(T):void, function(any):void]}
 */
const defer = () => {
  const result = []
  result.unshift(
    new Promise((resolve, reject) => {
      result.push(resolve, reject)
    })
  )
  return result
}
exports.defer = defer
