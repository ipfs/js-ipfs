'use strict'

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

module.exports = ({ serviceRegistry }) => {
  /**
   * Remove a single pin from a remote pinning service.
   * Fails if multiple pins match the specified query. Use rmAll to remove all pins that match.
   *
   * @param {Query & AbortOptions} options
   * @returns {Promise<void>}
   */
  async function rm (options) {
    const { service } = options
    const svc = serviceRegistry.serviceNamed(service)
    return svc.rm(options)
  }

  return withTimeoutOption(rm)
}

/**
 * @typedef {import('cids')} CID
 * @typedef {import('ipfs-core-types/src/basic').AbortOptions} AbortOptions
 * @typedef {import('ipfs-core-types/src/pin/remote').Pin} Pin
 * @typedef {import('ipfs-core-types/src/pin/remote').Query} Query
 */
