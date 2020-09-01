'use strict'
/* eslint-env browser */

const Client = require('./core')

// Set default configuration and call create function with them
/**
 * @typedef { import("./core").ClientOptions } ClientOptions
 */

/**
 * @template T
 * @typedef {(client: Client, clientOptions: ClientOptions) => T} Fn
 */

/**
 * @template T
 * @typedef {(clientOptions: ClientOptions) => T} Factory
 */

/**
 * @template T
 * @param {Fn<T>} fn
 * @returns {Factory<T>}
 */
const configure = (fn) => {
  return (options) => {
    return fn(new Client(options), options)
  }
}
module.exports = configure
