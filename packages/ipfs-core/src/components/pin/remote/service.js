'use strict'

const { Errors } = require('interface-datastore')
const ERR_NOT_FOUND = Errors.notFoundError().code

const createClient = require('./client')

/**
 * RemotePinServiceAPI provides methods to add, remove, and list the configured
 * remote pinning services that are used by the remote pinning api.
 *
 * @implements API
 */
class PinRemoteServiceAPI {
  /**
   * 
   * @param {Object} options 
   * @param {Config} options.config
   * @param {SwarmAPI} options.swarm
   * @param {PeerId} options.peerId
   */
  constructor ({ config, swarm, peerId }) {
    this.config = config
    this.swarm = swarm
    this.peerId = peerId

    this._clients = {}
    this._configured = false
  }

  async _loadConfig() {
    if (this._configured) {
      return
    }

    try {
      const pinConfig = /** @type {PinningConfig|null} */ (await this.config.get('Pinning'))
      if (pinConfig == null || pinConfig.RemoteServices == null) {
        this._configured = true
        return
      }

      for (const [name, svcConfig] of Object.entries(pinConfig.RemoteServices)) {
        if (svcConfig == null) {
          continue
        }
        const { Endpoint: endpoint, Key: key } = svcConfig.API
        if (!endpoint || !key) {
          continue
        }
        this._clients[name] = createClient({
          swarm: this.swarm,
          peerId: this.peerId,
          service: name,
          endpoint,
          key,
        })
      }
      this._configured = true
    } catch (e) {
      if (e.code !== ERR_NOT_FOUND) {
        throw e
      }
    }
  }

  /**
   * Adds a new remote pinning service to the set of configured services.
   *
   * @param {string} name - the name of the pinning service. Used to identify the service in future remote pinning API calls.
   * @param {Credentials & AbortOptions} credentials
   */
  async add (name, credentials) {
    await this._loadConfig()

    if (this._clients[name]) {
      throw new Error('service already present: ' + name)
    }

    if (!credentials.endpoint) {
      throw new Error('option "endpoint" is required')
    }

    if (!credentials.key) {
      throw new Error('option "key" is required')
    }

    await this.config.set(`Pinning.RemoteServices.${name}`, {
      API: {
        Endpoint: credentials.endpoint.toString(),
        Key: credentials.key,
      }
    })

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
    await this._loadConfig()

    opts = opts || { stat: false }

    const promises = []
    for (const svc of Object.values(this._clients)) {
      promises.push(svc.info(opts))
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
    await this._loadConfig()
    delete this._clients[name]
    const services = (await this.config.get('Pinning.RemoteServices')) || {}
    delete services[name]
    await this.config.set(`Pinning.RemoteServices`, services)
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
 * @typedef {import('../../config').PinningConfig} PinningConfig
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
