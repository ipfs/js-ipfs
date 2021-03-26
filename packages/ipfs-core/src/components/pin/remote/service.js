'use strict'

const createClient = require('./client')

/**
 * RemotePinServiceAPI provides methods to add, remove, and list the configured
 * remote pinning services that are used by the remote pinning api.
 *
 * @implements API
 */
class PinRemoteServiceAPI {
  constructor ({ config, swarm, peerId }) {
    this.config = config
    this.swarm = swarm
    this.peerId = peerId

    // TODO: read service config from IPFS config to construct remote service at init
    this._clients = {}
  }

  /**
   * Adds a new remote pinning service to the set of configured services.
   *
   * @param {string} name - the name of the pinning service. Used to identify the service in future remote pinning API calls.
   * @param {Credentials & AbortOptions} credentials
   */
  async add (name, credentials) {
    if (this._clients[name]) {
      throw new Error('service already present: ' + name)
    }

    if (!credentials.endpoint) {
      throw new Error('option "endpoint" is required')
    }

    if (!credentials.key) {
      throw new Error('option "key" is required')
    }

    this._clients[name] = createClient({
      swarm: this.swarm,
      peerId: this.peerId,
      service: name,
      ...credentials
    })
  }

  /**
   * List the configured remote pinning services.
   *
   * @param {{stat: ?boolean} & AbortOptions} opts
   * @returns {Promise<Array<RemotePinService> | Array<RemotePinServiceWithStat>>} - a Promise resolving to an array of objects describing the configured remote pinning services. If stat==true, each object will include more detailed status info, including the number of pins for each pin status.
   */
  // @ts-ignore: The API type definition is polymorphic on the value of the stat field. I'm not sure how to represent that in jsdoc.
  async ls (opts) {
    const { stat } = (opts || {})

    const promises = []
    for (const svc of Object.values(this._clients)) {
      promises.push(svc.info(stat))
    }
    return Promise.all(promises)
  }

  /**
   * Remove a remote pinning service from the set of configured services.
   *
   * @param {string} name - the name of the pinning service to remove
   * @returns {Promise<void>}
   */
  async rm (name) {
    if (!name) {
      throw new Error('parameter "name" is required')
    }
    delete this._clients[name]
  }

  /**
   * Returns a RemotePinningService object for the given service name. Throws if no service has been configured with the given name.
   *
   * @param {string} name
   * @returns {any}
   */
  serviceNamed (name) {
    if (!this._clients[name]) {
      throw new Error('no remote pinning service configured with name: ' + name)
    }
    return this._clients[name]
  }
}

// TODO: refactor all the things
module.exports = PinRemoteServiceAPI

/**
 * @typedef {import('../..').PeerId} PeerId
 * @typedef {import('../../swarm')} SwarmAPI
 * @typedef {import('../../config').Config} Config
 *
 * @typedef {import('ipfs-core-types/src/basic').AbortOptions} AbortOptions
 * @typedef {import('ipfs-core-types/src/pin/remote').Status} Status
 * @typedef {import('ipfs-core-types/src/pin/remote').Query} Query
 * @typedef {import('ipfs-core-types/src/pin/remote').Pin} Pin
 * @typedef {import('ipfs-core-types/src/pin/remote').AddOptions} AddOptions
 * @typedef {import('ipfs-core-types/src/pin/remote/service').API} API
 * @typedef {import('ipfs-core-types/src/pin/remote/service').Credentials} Credentials
 * @typedef {import('ipfs-core-types/src/pin/remote/service').RemotePinService} RemotePinService
 * @typedef {import('ipfs-core-types/src/pin/remote/service').RemotePinServiceWithStat} RemotePinServiceWithStat
 */
