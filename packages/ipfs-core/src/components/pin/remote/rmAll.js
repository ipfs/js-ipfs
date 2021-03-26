'use strict'

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

module.exports = ({ remotePinServices }) => {
  /**
   * Remove all pins that match the given criteria from a remote pinning service.
   *
   * @param {Query & AbortOptions} options
   * @returns {Promise<void>}
   */
   async function rmAll (options) {
    const { service, ...rmOpts } = options
    if (!service) {
      throw new Error('service name must be passed')
    }
    const svc = remotePinServices.serviceNamed(service)
    return svc.rmAll(rmOpts)
  }

  return withTimeoutOption(rmAll)
}

/**
 * @typedef {import('cids')} CID
 * @typedef {import('ipfs-core-types/src/basic').AbortOptions} AbortOptions
 * @typedef {import('ipfs-core-types/src/pin/remote').Pin} Pin
 * @typedef {import('ipfs-core-types/src/pin/remote').Query} Query
 */
