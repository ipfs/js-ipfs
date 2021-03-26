'use strict'

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

module.exports = ({ remotePinServices }) => {
  /**
   * Remove a single pin from a remote pinning service.
   * Fails if multiple pins match the specified query. Use rmAll to remove all pins that match.
   *
   * @param {Query & AbortOptions} options
   * @returns {Promise<void>}
   */
  async function rm (options) {
    const { service, ...rmOpts } = options
    if (!service) {
      throw new Error('service name must be passed')
    }
    const svc = remotePinServices.serviceNamed(service)
    return svc.rm(rmOpts)
  }

  return withTimeoutOption(rm)
}

/**
 * @typedef {import('cids')} CID
 * @typedef {import('ipfs-core-types/src/basic').AbortOptions} AbortOptions
 * @typedef {import('ipfs-core-types/src/pin/remote').Pin} Pin
 * @typedef {import('ipfs-core-types/src/pin/remote').Query} Query
 */
