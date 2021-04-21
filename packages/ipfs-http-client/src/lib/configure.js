'use strict'
/* eslint-env browser */

const Client = require('./core')

// Set default configuration and call create function with them
/**
 * @typedef { import("../types").Options } Options
 */

/**
 * @template T
 * @typedef {(client: Client, clientOptions: Options) => T} Fn
 */

/**
 * @template T
 * @typedef {(clientOptions: Options) => T} Factory
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
