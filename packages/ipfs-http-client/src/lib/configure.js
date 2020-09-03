'use strict'
/* eslint-env browser */

const Client = require('./core')

// Set default configuration and call create function with them
/**
 * @typedef { import("./core").ClientOptions } ClientOptions
 */

/**
 * @param {function(Client, ClientOptions): void} fn
 * @returns {function(ClientOptions): void}
 */
const configure = (fn) => {
  return (options) => {
    return fn(new Client(options), options)
  }
}
module.exports = configure
