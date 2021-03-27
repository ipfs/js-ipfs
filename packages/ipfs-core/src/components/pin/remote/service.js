'use strict'

const { Errors } = require('interface-datastore')
const ERR_NOT_FOUND = Errors.notFoundError().code

const createClient = require('./client')

/**
 *
 * @param {Object} options
 * @param {Config} options.config
 * @param {SwarmAPI} options.swarm
 * @param {PeerId} options.peerId
 * @returns {API}
 */
module.exports = ({ config, swarm, peerId }) => {
  let configured = false
  const clients = {}

  async function loadConfig () {
    if (configured) {
      return
    }

    try {
      const pinConfig = /** @type {PinningConfig|null} */ (await config.get('Pinning'))
      if (pinConfig == null || pinConfig.RemoteServices == null) {
        configured = true
        return
      }

      for (const [service, svcConfig] of Object.entries(pinConfig.RemoteServices)) {
        if (svcConfig == null) {
          continue
        }
        const { Endpoint: endpoint, Key: key } = svcConfig.API
        if (!endpoint || !key) {
          continue
        }
        clients[service] = createClient({
          swarm,
          peerId,
          service,
          endpoint,
          key
        })
      }
    } catch (e) {
      if (e.code !== ERR_NOT_FOUND) {
        throw e
      }
    }

    configured = true
  }

  /**
   * Adds a new remote pinning service to the set of configured services.
   *
   * @param {string} name - the name of the pinning service. Used to identify the service in future remote pinning API calls.
   * @param {Credentials & AbortOptions} credentials
   */
  async function add (name, credentials) {
    await loadConfig()

    if (clients[name]) {
      throw new Error('service already present: ' + name)
    }

    if (!credentials.endpoint) {
      throw new Error('option "endpoint" is required')
    }

    if (!credentials.key) {
      throw new Error('option "key" is required')
    }

    await config.set(`Pinning.RemoteServices.${name}`, {
      API: {
        Endpoint: credentials.endpoint.toString(),
        Key: credentials.key
      }
    })

    clients[name] = createClient({
      swarm,
      peerId,
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
  async function ls (opts) {
    await loadConfig()

    opts = opts || { stat: false }

    const promises = []
    for (const svc of Object.values(clients)) {
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
  async function rm (name) {
    if (!name) {
      throw new Error('parameter "name" is required')
    }
    await loadConfig()
    delete clients[name]
    const services = (await config.get('Pinning.RemoteServices')) || {}
    delete services[name]
    await config.set('Pinning.RemoteServices', services)
  }

  /**
   * Returns a client for the service with the given name. Throws if no service has been configured with the given name.
   *
   * @param {string} name
   * @returns {any}
   */
  function serviceNamed (name) {
    if (!clients[name]) {
      throw new Error('no remote pinning service configured with name: ' + name)
    }
    return clients[name]
  }

  return {
    add,
    // @ts-ignore: The API type definition for the ls method is polymorphic on the value of the stat field. I'm not sure how to represent that in jsdoc.
    ls,
    rm,
    serviceNamed
  }
}

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
