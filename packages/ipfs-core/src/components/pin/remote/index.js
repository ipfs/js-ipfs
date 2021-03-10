'use strict'

/**
 * @typedef {import('cids')} CID
 *
 * @typedef {'queued'|'pinning'|'pinned'|'failed'} PinStatus
 * 
 * @typedef {object} RemotePin
 * @property {string} [cid]
 * @property {PinStatus} [status]
 * @property {?string} [name]
 * @property {?object} [meta]
 */

class RemotePinAPI {

  constructor() {
    this.service = new RemotePinServiceAPI()
  }

  /**
   * Asks a remote pinning service to pin an IPFS object from a given path
   * 
   * @typedef {object} RemotePinAddOptions
   * @property {string} [service] name of a configured remote pinning service
   * @property {?string} [name] optional descriptive name for pin
   * @property {?Object<string, string>} [meta] optional metadata to attach to pin
   * @property {?number} [timeout] request timeout (seconds)
   * @property {?boolean} [background] If true, add returns remote a pin object as soon as the remote service responds.
   *   The returned pin object may have a status of 'queued' or 'pinning'. 
   *   If false, the add method will not resolve until the pin status is 'pinned' before returning.
   *   When background==false and the remote service returns a status of 'failed', an Error will be thrown.
   * 
   * @param {string|CID} cid
   * @param {RemotePinAddOptions} options
   * @returns {Promise<RemotePin>}
   */
  async add(cid, options) {
    throw new Error('not yet implemented')
  }
  
  /**
   * List objects that are pinned by a remote service.
   * 
   * @typedef {object} RemotePinLsOptions
   * @property {string} [service] name of a configured remote pinning service
   * @property {?Array<string|CID>} [cid] return pins for the specified CID(s)
   * @property {?string} [name] return pins that contain the provided value (case-sensitive, exact match)
   * @property {?Array<PinStatus>} [status] return pins with the specified statuses (queued, pinning, pinned, failed). Default: pinned
   * @property {?number} [timeout] request timeout (seconds)

   * @param {RemotePinLsOptions} options
   * @returns {AsyncGenerator<RemotePin>} 
   */
  async * ls(options) {
    throw new Error('not yet implemented')
  }

  /**
   * Remove a single pin from a remote pinning service. 
   * Fails if multiple pins match the specified criteria. Use rmAll to remove all pins that match.
   * 
   * @typedef {object} RemotePinRmOptions
   * @property {string} [service] name of a configured remote pinning service
   * @property {Array<string>} [cid] CID(s) to remove from remote pinning service
   * @property {?Array<PinStatus>} [status] only remove pins that have one of the specified statuses (queued, pinning, pinned, failed). Default: pinned
   * @property {?number} [timeout] request timeout (seconds)
   * 
   * @param {RemotePinRmOptions} options
   * @returns {Promise<void>}
   */
  async rm(options) {
    throw new Error('not yet implemented')
  }

  /**
   * Remove all pins that match the given criteria from a remote pinning service. 
   * 
   * @param {RemotePinRmOptions} options
   * @returns {Promise<void>}
   */
  async rmAll(options) {
      throw new Error('not yet implemented')
    }
}

/**
 * RemotePinServiceAPI provides methods to add, remove, and list the configured
 * remote pinning services that are used by the RemotePinAPI.
 */
class RemotePinServiceAPI {

  /**
   * Adds a new remote pinning service to the set of configured services.
   * 
   * @typedef {object} RemotePinServiceAddOptions
   * @property {string|URL} [endpoint] the remote API endpoint URL
   * @property {string} [key] an API key that authorizes use of the remote pinning service
   * 
   * @param {string} name the name of the pinning service. Used to identify the service in future remote pinning API calls.
   * @param {RemotePinServiceAddOptions} options
   */
  async add(name, options) {
    throw new Error('not yet implemented')
  }

  /**
   * List the configured remote pinning services.
   * 
   * @typedef {object} RemotePinningServiceDescription
   * @property {string} name
   * @property {URL} endpoint
   * 
   * @return {Promise<Array<RemotePinningServiceDescription>>}
   */
  async ls() {
    throw new Error('not yet implemented')
  }

  /**
   * Remove a remote pinning service from the set of configured services.
   * 
   * @param {string} name the name of the pinning service to remove
   * @returns {Promise<void>}
   */
  async rm(name) {
    throw new Error('not yet implemented')
  }
}

module.exports = RemotePinAPI
