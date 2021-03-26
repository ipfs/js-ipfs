'use strict'

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

module.exports = ({ remotePinServices }) => {
  /**
   * Asks a remote pinning service to pin an IPFS object from a given path
   *
   * @param {string|CID} cid
   * @param {AddOptions & AbortOptions} options
   * @returns {Promise<Pin>}
   */
  async function add (cid, options) {
    const { service, ...addOpts } = options
    if (!service) {
      throw new Error('service name must be passed')
    }
    const svc = remotePinServices.serviceNamed(service)
    return svc.add(cid, addOpts)
  }

  return withTimeoutOption(add)
}

/**
 * @typedef {import('cids')} CID
 * @typedef {import('ipfs-core-types/src/basic').AbortOptions} AbortOptions
 * @typedef {import('ipfs-core-types/src/pin/remote').Pin} Pin
 * @typedef {import('ipfs-core-types/src/pin/remote').AddOptions} AddOptions
 */
