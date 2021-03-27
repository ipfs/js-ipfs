'use strict'

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

module.exports = ({ serviceRegistry }) => {
  /**
   * List objects that are pinned by a remote service.
   *
   * @param {Query & AbortOptions} options
   * @returns {AsyncGenerator<Pin>}
   */
  async function * ls (options) {
    const { service, ...lsOpts } = options
    if (!service) {
      throw new Error('service name must be passed')
    }
    const svc = serviceRegistry.serviceNamed(service)
    for await (const res of svc.ls(lsOpts)) {
      yield res
    }
  }

  return withTimeoutOption(ls)
}

/**
 * @typedef {import('cids')} CID
 * @typedef {import('ipfs-core-types/src/basic').AbortOptions} AbortOptions
 * @typedef {import('ipfs-core-types/src/pin/remote').Pin} Pin
 * @typedef {import('ipfs-core-types/src/pin/remote').Status} Status
 * @typedef {import('ipfs-core-types/src/pin/remote').Query} Query
 */
