'use strict'

/**
 * Represents server query, encapsulating inputs to the server endpoint and
 * promise of it's result.
 *
 * @template I,O
 */
module.exports = class Query {
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
   *
   * @returns {Object}
   */
  toJSON () {
    return this.input
  }

  /**
   * Data that will be transferred over message channel.
   *
   * @returns {Transferable[]|void}
   */
  transfer () {
    return this.input.transfer
  }
}

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
